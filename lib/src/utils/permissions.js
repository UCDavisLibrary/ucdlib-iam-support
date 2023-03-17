import pg from "./pg.js";
import TextUtils from "./text.js";

/**
 * @description Manages pg data for permission requests
 */
class PermissionsRequests{
  constructor(){

  }

  /**
   * @description Returns most recent permissions object for specified onboarding request
   * @param {Number} id - Onboarding request ID
   */
  async getOnboardingPermissions(id=0){
    const params = [id];
    const text = `
      SELECT p.*, obr.supervisor_id
      FROM permissions_requests p
      LEFT JOIN onboarding_requests obr on onboarding_request_id = obr.id
      WHERE 
        revision IN (SELECT max(revision) From permissions_requests WHERE onboarding_request_id = $1)
        AND onboarding_request_id = $1
    `;
    return await pg.query(text, params);
  }

  async create(data){
    let text = 'INSERT INTO permissions_requests(';
    let props = [
      'onboardingRequestId','iamId', 'rtTicketId', 
      'needsSupervisorApproval', 'hasSupervisorApproval', 
      'revision', 'permissions', 'notes', 'submittedBy'
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
}

export default new PermissionsRequests();