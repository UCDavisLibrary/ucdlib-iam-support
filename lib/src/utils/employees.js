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
      noSupervisor: {
        slug: 'no-supervisor',
        label: 'No Supervisor',
        description: "Employee's UCD IAM record does not have an associated supervisor id."
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

  /**
   * @description Returns employee by id
   * @param {String} id - employee id
   * @param {String} idType - id, iamId, employeeId, userId, email
   * @param {Object} options - options object with the following properties:
   * @param {Boolean} options.returnGroups - return employee's groups
   * @param {Boolean} options.returnSupervisor - return employee's supervisor
   * @returns
   */
  async getById(id, idType='id', options={}){
    const params = [id];
    const { returnGroups, returnSupervisor } = options;
    const text = `
      SELECT e.*
      ${returnGroups ? `, json_agg(${this.groupJson()}) as groups` : ''}
      ${returnSupervisor ? `, ${this.supervisorJson()} as supervisor` : ''}
      FROM employees as e
      ${returnGroups ? `
        LEFT JOIN group_membership as gm on e.id = gm.employee_key
        LEFT JOIN groups as g on gm.group_id = g.id
        LEFT JOIN group_types as gt on g.type = gt.id
      ` : ''}
      ${returnSupervisor ? `
        LEFT JOIN employees as supervisor on e.supervisor_id = supervisor.iam_id
      ` : ''}
      WHERE
        e.${TextUtils.underscore(idType)} = $1
        ${returnGroups ? 'AND (NOT g.archived OR g.archived IS NULL)' : ''}
      ${returnGroups || returnSupervisor ? 'GROUP BY e.id' : ''}
      ${returnSupervisor ? ', supervisor.id' : ''}
    `;
    return await pg.query(text, params);
  }

  /**
   * @description Returns employee by any unique id type
    * @param {Object} ids - object with any of the following properties: iamId, employeeId, userId, email
   */
  async getByAnyId(ids={}){
    const props = ['iamId', 'employeeId', 'userId', 'email', 'id'];
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

  /**
   * @description Search for employees by first or last name
   * @param {*} name
   * @returns
   */
  async searchByName(name){
    const names = name.split(' ');
    const params = [];
    let text = `
      SELECT
        e.*,
        json_agg(${this.groupJson()}) as groups,
        ${this.supervisorJson()} as supervisor
      FROM employees as e
      LEFT JOIN group_membership as gm on e.id = gm.employee_key
      LEFT JOIN groups as g on gm.group_id = g.id
      LEFT JOIN group_types as gt on g.type = gt.id
      LEFT JOIN employees as supervisor on e.supervisor_id = supervisor.iam_id
      WHERE
        (NOT g.archived OR g.archived IS NULL)
    `;
    for (let name of names) {
      name = name.trim();
      if ( !name ) continue;
      text += ` AND (e.first_name ILIKE $${params.length + 1} OR e.last_name ILIKE $${params.length + 1})`;
      params.push(`%${name}%`);
    }
    text += 'GROUP BY e.id, supervisor.id ORDER BY e.last_name, e.first_name';
    return await pg.query(text, params);
  }

  async getAll(){
    const text = `
      SELECT
          e.*,
          json_agg(${this.groupJson()}) as groups,
          ${this.supervisorJson()} as supervisor
        FROM employees as e
        LEFT JOIN group_membership as gm on e.id = gm.employee_key
              LEFT JOIN groups as g on gm.group_id = g.id
              LEFT JOIN group_types as gt on g.type = gt.id
              LEFT JOIN employees as supervisor on e.supervisor_id = supervisor.iam_id
        WHERE
                (NOT g.archived OR g.archived IS NULL)
        GROUP BY e.id, supervisor.id 
        ORDER BY e.last_name, e.first_name
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

  async getDirectReports(iamId){
    const params = [iamId];
    const text = `
      SELECT *
      FROM employees
      WHERE supervisor_id = $1
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

  /**
   * @description Return 'json_build_object' SQL function for a group
   * @param {Object} aliases - optional aliases for group, groupType, and groupMembership tables
   * @param {String} aliases.group - alias for group table
   * @param {String} aliases.groupType - alias for groupType table
   * @param {String} aliases.groupMembership - alias for groupMembership table
   * @returns {String}
   */
  groupJson(aliases={}){
    const groupTable = aliases.group || 'g';
    const groupTypeTable = aliases.groupType || 'gt';
    const groupMembershipTable = aliases.groupMembership || 'gm';

    return `
      json_build_object(
        'id', ${groupMembershipTable}.group_id,
        'isHead', ${groupMembershipTable}.is_head,
        'name', ${groupTable}.name,
        'type', ${groupTypeTable}.name,
        'typeId', ${groupTypeTable}.id,
        'partOfOrg', ${groupTypeTable}.part_of_org
      )
    `
  }

  /**
   * @description Return 'json_build_object' SQL function for a supervisor
   * @param {Object} aliases - optional aliases for supervisor table
   * @param {String} aliases.supervisor - alias for supervisor table
   * @returns {String}
   */
  supervisorJson(aliases={}){
    const supervisorTable = aliases.supervisor || 'supervisor';
    return `
      json_build_object(
        'iamId', ${supervisorTable}.iam_id,
        'firstName', ${supervisorTable}.first_name,
        'lastName', ${supervisorTable}.last_name,
        'title', ${supervisorTable}.title,
        'email', ${supervisorTable}.email
      )
    `
  }
}

export default new UcdlibEmployees();
