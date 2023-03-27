import pg from "./pg.js";
import TextUtils from "./text.js";

class UcdlibEmployees {
  constructor() {}

  async create(data){
    let text = 'INSERT INTO employees(';
    let props = [
      'iamId', 'employeeId', 'userId', 'email',
      'firstName', 'lastName', 'middleName', 'suffix',
      'supervisorId', 'types', 'ucdDeptCode', 'primaryAssociation',
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