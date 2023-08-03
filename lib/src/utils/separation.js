import pg from "./pg.js";
import TextUtils from "./text.js";

/**
 * @description Manages pg data for separation form
 */
class UcdlibSeparation{
  constructor() {
  }

  /**
   * @description Writes a new separation request to database
   * @param {Object} data - Data to insert. Field keys should be camelCased
   */
  async create(data){
    let text = 'INSERT INTO separation_requests(';
    let props = ['iamId', 'separationDate','supervisorId', 'notes', 'additionalData','submittedBy'];
    const values = [];
    for (const prop of props) {
      if ( data.hasOwnProperty(prop) ){
        if(prop == "iamId") text += `${TextUtils.underscore(prop)}`;
        else text += `, ${TextUtils.underscore(prop)}`;
        
        values.push(data[prop]);
      }
    }

    text += `) VALUES ${pg.valuesArray(values)} RETURNING id`;

    return await pg.query(text, values);
  }

  /**
   * @description Retrieve an separation request by its id
   * @param {*} id
   */
  async getById(id){
    const text = `
    SELECT r.*
    FROM
      separation_requests r
    WHERE
      r.id = $1
    `;
    return await pg.query(text, [id]);
  }


  /**
   * @description Performs basic query of separation requests
   * @param {Object} q - Query object where keys are filters:
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
    SELECT r.*
    FROM
      separation_requests r
    `;

    if ( q.iamId ) whereParams['r.iam_id'] = q.iamId;
    if ( q.rtTicketId ) whereParams['r.rt_ticket_id'] = q.rtTicketId;
    if ( q.supervisorId ) whereParams['r.supervisor_id'] = q.supervisorId;

    if ( q.orderAsc ) orderAsc = true;
    if ( q.orderBy && ['submitted', 'separation_date'].includes(q.orderBy) ) {
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
   * @description Retrieve an separation request by its name
   * @param {String} first - first name
   * @param {String} last - last name
   */
    async getByName(first, last){
      let where = [];
      const params = [];
      const text = `
      SELECT r.*
      FROM
        separation_requests r
      `;

      if(first){
        let w = `r.additional_data->>'employeeFirstName' ILIKE $${params.length + 1}`;
        where.push(w);
        params.push('%' + first + '%');
      }
      if(last){
        let w = `r.additional_data->>'employeeLastName' ILIKE $${params.length + 1}`;
        where.push(w);
        params.push('%' + last + '%');
      }
      if ( !where.length ) {
        return pg.returnError('no valid parameters');
      }

      let texts = text + `WHERE ` +  where.join(' AND ');
      return await pg.query(texts, params);
    }


  /**
   * @description Delete an separation request by id
   * @param {Number} id - Unique identifier of request
   * @returns
   */
  async delete(id){
    if ( !id ) id = 0;
    const text = `
      DELETE FROM separation_requests WHERE id=$1 RETURNING id
    `;
    return await pg.query(text, [id]);
  }

  /**
   * @description Update select value(s) of an separation request by id
   * @param {Number} id - Request id
   * @param {Object} v - Values as object with following allowed keys:
   * - iamId
   * - rtTicketId
   * - statusId
   * - additionalData
   * - modifiedBy
   * @returns
   */
  async update(id, v={}){
    if ( !id ) {
      return pg.returnError('id is required when updating separation request');
    }

    const toUpdate = {};
    if ( v.iamId ) {
      toUpdate['iam_id'] = v.iamId;
    }
    if ( v.rtTicketId ) {
      toUpdate['rt_ticket_id'] = v.rtTicketId;
    }
    if ( v.additionalData ){
      toUpdate['additional_data'] = v.additionalData;
    }

    if ( !Object.keys(toUpdate).length ){
      return pg.returnError('no valid fields to update');
    }

    const updateClause = pg.toUpdateClause(toUpdate);
    const text = `
    UPDATE separation_requests SET ${updateClause.sql}
    WHERE id = $${updateClause.values.length + 1}
    RETURNING id
    `;
    return await pg.query(text, [...updateClause.values, id]);
  }
}

export default new UcdlibSeparation();
