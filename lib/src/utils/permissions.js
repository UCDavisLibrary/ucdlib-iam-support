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
   * @param {Number} - Onboarding request ID
   */
  async getOnboardingPermissions(id=0){
    const text = `
      SELECT * FROM permissions_requests 
      WHERE 
        revision IN (SELECT max(revision) From permissions_requests WHERE onboarding_request_id = $1)
        AND onboarding_request_id = $1
    `;
    return await pg.query(text, [id]);
  }
}