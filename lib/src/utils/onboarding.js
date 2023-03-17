import pg from "./pg.js";
import TextUtils from "./text.js";

/**
 * @description Manages pg data for onboarding form
 */
class UcdlibOnboarding{
  constructor() {
    this.statusCodes = {
      'submitted': 1,
      'supervisor': 2
    };
  }

  /**
   * @description Writes a new onboarding request to database
   * @param {Object} data - Data to insert. Field keys should be camelCased
   */
  async create(data){
    let text = 'INSERT INTO onboarding_requests(';
    let props = [
      'iamId', 'rtTicketId', 'startDate', 'libraryTitle', 
      'groupIds', 'supervisorId', 'notes', 'additionalData', 
      'skipSupervisor', 'submittedBy', 'modifiedBy'];
    const values = [];

    let statusId = this.statusCodes['supervisor'];
    if ( data.skipSupervisor || !data.supervisorId ) {
      statusId = this.statusCodes['submitted'];
    }
    values.push(statusId);
    text += 'status_id';
    for (const prop of props) {
      if ( data.hasOwnProperty(prop) ){
        text += `, ${TextUtils.underscore(prop)}`;
        values.push(data[prop]);
      }
    }
    
    text += `) VALUES ${pg.valuesArray(values)} RETURNING id`;
    return await pg.query(text, values);
  }

  /**
   * @description Retrieve an onboarding request by its id
   * @param {*} id 
   */
  async getById(id){
    const text = `
    SELECT r.*, sc.name as status_name, sc.is_open as is_active_status
    FROM
      onboarding_requests r
    left join status_codes sc on sc.id = r.status_id
    WHERE
      r.id = $1
    `;
    return await pg.query(text, [id]);
  }

  /**
   * @description Performs basic query of onboarding requests
   * @param {Object} q - Query object where keys are filters:
   * - statusId (int)
   * - isOpen (bool)
   * - iamId (str)
   * - rtTicketId (str)
   * - supervisorId (str)
   * - orderBy (str)
   * - orderAsc (bool)
   */
  async query(q){
    const whereParams = {};
    let orderBy = 'submitted';
    let orderAsc = false;
    let text = `
    SELECT r.*, sc.name as status_name, sc.is_open as is_active_status
    FROM
      onboarding_requests r
    left join status_codes sc on sc.id = r.status_id
    `;
    
    if ( q.statusId ) whereParams['r.status_id'] = q.statusId;
    if ( q.hasOwnProperty('isOpen') ) whereParams['sc.is_open'] = q.isOpen;
    if ( q.iamId ) whereParams['r.iam_id'] = q.iamId;
    if ( q.rtTicketId ) whereParams['r.rt_ticket_id'] = q.rtTicketId;
    if ( q.supervisorId ) whereParams['r.supervisor_id'] = q.supervisorId;

    if ( q.orderAsc ) orderAsc = true;
    if ( q.orderBy && ['submitted', 'modified', 'startDate'].includes(q.orderBy) ) {
      orderBy = TextUtils.underscore(q.orderBy);
    }

    const whereClause = pg.toWhereClause(whereParams);
    if ( whereClause.sql ) {
      text = `${text} WHERE ${whereClause.sql}`;
    }
    text = `${text} ORDER BY ${orderBy} ${orderAsc ? 'ASC' : 'DESC'}`;
    return await pg.query(text, whereClause.values);
  }

  /**
   * @description Delete an onboarding request by id
   * @param {Number} id - Unique identifier of request
   * @returns 
   */
  async delete(id){
    if ( !id ) id = 0;
    const text = `
      DELETE FROM onboarding_requests WHERE id=$1 RETURNING id
    `;
    return await pg.query(text, [id]);
  }

  /**
   * @description Update select value(s) of an onboarding request by id
   * @param {Number} id - Request id
   * @param {Object} v - Values as object with following allowed keys:
   * - rtTicketId
   * @returns 
   */
  async update(id, v={}){
    if ( !id ) {
      return pg.returnError('id is a required argument.');
    }

    const toUpdate = {};
    if ( v.rtTicketId ) {
      toUpdate['rt_ticket_id'] = v.rtTicketId;
    }
    if ( !Object.keys(toUpdate).length ){
      return pg.returnError('no valid fields to update');
    }

    const updateClause = pg.toUpdateClause(toUpdate);
    const text = `
    UPDATE onboarding_requests SET ${updateClause.sql}
    WHERE id = $${updateClause.values.length + 1}
    `;
    return await pg.query(text, [...updateClause.values, id]);
  }
}

export default new UcdlibOnboarding();