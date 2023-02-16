import Pg from "./pg.js";

/**
 * @description Manages pg data for onboarding form
 */
class UcdlibOnboarding{
  constructor() {
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

    values.push(1);
    text += 'status_id';
    for (const prop of props) {
      if ( data.hasOwnProperty(prop) ){
        text += `, ${Pg.underscore(prop)}`;
        values.push(data[prop]);
      }
    }
    
    text += `) VALUES (${(values.map((v, i) => `$${i + 1}`).join(', '))}) RETURNING id`;
    return await Pg.query(text, values);
  }
}

export default new UcdlibOnboarding();