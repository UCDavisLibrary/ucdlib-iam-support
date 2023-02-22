import Pg from "./pg.js";
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

    let statusId = this.statusCodes['submitted'];
    if ( data.skipSupervisor || !data.supervisorId ) {
      statusId = this.statusCodes['supervisor'];
    }
    values.push(statusId);
    text += 'status_id';
    for (const prop of props) {
      if ( data.hasOwnProperty(prop) ){
        text += `, ${TextUtils.underscore(prop)}`;
        values.push(data[prop]);
      }
    }
    
    text += `) VALUES ${Pg.valuesArray(values)} RETURNING id`;
    return await Pg.query(text, values);
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
    return await Pg.query(text, [id]);
  }

  /**
   * @description Performs basic query of onboarding requests
   * @param {Object} q - Query object where keys are filters:
   * - statusId (int)
   * - isOpen (bool)
   */
  async query(q){
    const whereParams = {};
    let text = `
    SELECT r.*, sc.name as status_name, sc.is_open as is_active_status
    FROM
      onboarding_requests r
    left join status_codes sc on sc.id = r.status_id
    `;
    
    if ( q.statusId ) whereParams['r.status_id'] = q.statusId;
    if ( q.hasOwnProperty('isOpen') ) whereParams['sc.is_open'] = q.isOpen;

    const hydration = Pg.toWhereClause(whereParams);
    console.log(hydration);
    if ( hydration.sql ) {
      text = `${text} WHERE ${hydration.sql}`;
    }
    return await Pg.query(text, hydration.values);
  }
}

export default new UcdlibOnboarding();