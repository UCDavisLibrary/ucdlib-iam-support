import pg from "./pg.js";
import TextUtils from "./text.js";

class UcdlibEmployees {
  constructor() {

    // why an employee's record might be outdated
    this.outdatedReasons = {
      noIamRecord: {
        slug: 'no-iam-record',
        label: 'No IAM Record',
        description: 'No UCD IAM record found for this employee.'
      }, 
      noAppointment: {
        slug: 'no-appointment',
        label: 'No Appointment',
        description: "Employee's UCD IAM record does not have an appointment."
      },
      multipleAppointments: {
        slug: 'multiple-appointments',
        label: 'Multiple Appointments',
        description: "Employee has multiple appointments in UCD IAM record, and library record does not specify the primary appointment."
      },
      deptCodeNotFound: {
        slug: 'dept-code-not-found',
        label: 'Department Code Not Found',
        description: "Employee's UCD department code in library record not found in UCD IAM record appointments"
      },
      appointmentDateAnomaly: {
        slug: 'appt-date-anomaly',
        label: 'Appointment Date Anomaly',
        description: "Library employee record creation date is less than appointment start date in UCD IAM record, and IAM appointment does not have a library department code."
      },
      missingUserId: {
        slug: 'missing-user-id',
        label: 'Missing User ID',
        description: "Employee's UCD IAM record does not have a user id (kerberos)."
      },
      noSupervisorIamRecord: {
        slug: 'no-supervisor-iam-record',
        label: 'No Supervisor IAM Record',
        description: "Employee's supervisor in library record does not have a UCD IAM record."
      },
      supervisorNotLibraryEmployee: {
        slug: 'supervisor-not-library-employee',
        label: 'Supervisor Not Library Employee',
        description: "Employee's supervisor in library record is not in list of active employees."
      }
    }

    this.libDeptCodes = ['060500'];
  }

  async create(data){
    let text = 'INSERT INTO employees(';
    let props = [
      'iamId', 'employeeId', 'userId', 'email',
      'firstName', 'lastName', 'middleName', 'suffix', 'title',
      'supervisorId', 'customSupervisor', 'types', 'ucdDeptCode', 'primaryAssociation',
      'additionalData'
    ];

    const values = [];
    let first = true;
    for (const prop of props) {
      if ( data.hasOwnProperty(prop) ){
        if ( first ) {
          text += TextUtils.underscore(prop);
          first = false;
        } else {
          text += `, ${TextUtils.underscore(prop)}`;
        }
        values.push(data[prop]);
      }
    }
    
    text += `) VALUES ${pg.valuesArray(values)} RETURNING id`;
    return await pg.query(text, values);
  }

  async getById(id, idType='id'){
    const params = [id];
    const text = `
      SELECT *
      FROM employees
      WHERE ${TextUtils.underscore(idType)} = $1
    `;
    return await pg.query(text, params);
  }

  /**
   * @description Returns employee by any unique id type
    * @param {Object} ids - object with any of the following properties: iamId, employeeId, userId, email
   */
  async getByAnyId(ids={}){
    const props = ['iamId', 'employeeId', 'userId', 'email'];
    const whereParams = {};
    for (const prop of props) {
      if ( ids[prop] ) whereParams[prop] = ids[prop];
    }
    if ( !Object.keys(whereParams).length ) return pg.returnError('No valid id provided');
    const whereClause = pg.toWhereClause(whereParams, true, true);
    const text = `
      SELECT *
      FROM employees
      WHERE ${whereClause.sql}
    `;
    return await pg.query(text, whereClause.values);
    
  }

  async getAll(){
    const text = `
      SELECT *
      FROM employees
      ORDER BY last_name, first_name
    `;
    return await pg.query(text);
  }

  async update(id, data, idType = 'id'){

    data.modified = new Date();
    const updateClause = pg.toUpdateClause(data, true);
    const text = `
    UPDATE employees SET ${updateClause.sql}
    WHERE ${TextUtils.underscore(idType)} = $${updateClause.values.length + 1}
    `;
    return await pg.query(text, [...updateClause.values, id]);
  }

  async removeAllGroupMemberships(employeeTableId){
    const params = [employeeTableId];
    const text = `
      DELETE FROM group_membership
      WHERE employee_key = $1
    `;
    return await pg.query(text, params);
  }

  async delete(id, idType = 'id'){
    if ( !id || !idType ) return pg.returnError('No id or idType provided');
    const params = [id];
    const text = `
      DELETE FROM employees
      WHERE ${TextUtils.underscore(idType)} = $1
    `;
    return await pg.query(text, params);
  }

  // add employee to a group. fail silently if employee already in group
  async addEmployeeToGroup(employeeTableId, groupId, isHead=false){
    const params = [employeeTableId, groupId];
    if ( isHead ) params.push(isHead);
    const text = `
      INSERT INTO group_membership (employee_key, group_id${isHead ? ', is_head' : ''})
      VALUES ($1, $2${isHead ? ', $3' : ''})
      ON CONFLICT DO NOTHING
    `;
    return await pg.query(text, params);
  }

  async removeEmployeeFromGroup(employeeTableId, groupId){
    const params = [employeeTableId, groupId];
    const text = `
      DELETE FROM group_membership
      WHERE employee_key = $1
      AND group_id = $2
    `;
    return await pg.query(text, params);
  }

  /**
   * @description Returns employee record of all supervisors
   */
  async getAllSupervisors(){
    const text = `
      SELECT DISTINCT s.*
      from employees as s
      LEFT JOIN
        employees as e on s.iam_id = e.supervisor_id
      WHERE e.supervisor_id IS NOT NULL
      AND e.supervisor_id = s.iam_id
      ORDER BY s.last_name, s.first_name
    `;
    return await pg.query(text);
  }

  async createRecordDiscrepancyNotification(iamId, reason){
    const params = [iamId, reason];
    const text = `
      INSERT INTO outdated_records (iam_id, reason)
      VALUES ($1, $2)
      ON CONFLICT (reason, iam_id) DO UPDATE SET fixed = false, created = NOW()
      WHERE outdated_records.fixed = true
    `;
    return await pg.query(text, params);
  }

  async dismissRecordDiscrepancyNotifications(iamId){
    if ( !iamId ) return pg.returnError('No iamId provided');
    const params = [iamId];
    const text = `
      UPDATE outdated_records
      SET fixed = true
      WHERE iam_id = $1
    `;
    return await pg.query(text, params);
  }

  async getActiveRecordDiscrepancyNotifications(olderThanInterval){
    const text = `
      SELECT *
      FROM outdated_records
      WHERE NOT fixed
      ${olderThanInterval ? `AND created < NOW() - INTERVAL '${olderThanInterval}'` : ''}
    `;
    return await pg.query(text);
  } 
}

export default new UcdlibEmployees();