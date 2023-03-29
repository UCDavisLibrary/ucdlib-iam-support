import pg from "./pg.js";
import TextUtils from "./text.js";

class UcdlibEmployees {
  constructor() {
    this.outdatedReasons = {
      noIamRecord: {
        slug: 'no-iam-record',
        description: 'No UCD IAM record found for this employee.'
      }, 
      multipleAppointments: {
        slug: 'multiple-appointments',
        description: "Employee has multiple appointments in UCD IAM record, and library record does not specify the primary appointment."
      },
      supervisorNotFound: {
        slug: 'supervisor-not-found',
        description: "Employee's supervisor in library record is not in list of active employees."
      }, 
      deptCodeNotFound: {
        slug: 'dept-code-not-found',
        description: "Employee's UCD department code in library record not found in UCD IAM record appointments"
      },
      tesDateAnomaly: {
        slug: 'tes-date-anomaly',
        description: "TES library employee record creation date is less than appointment start date in UCD IAM record"
      },
    }
  }

  async create(data){
    let text = 'INSERT INTO employees(';
    let props = [
      'iamId', 'employeeId', 'userId', 'email',
      'firstName', 'lastName', 'middleName', 'suffix',
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
}

export default new UcdlibEmployees();