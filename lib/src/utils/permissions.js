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

  async getUpdatePermissions(id=0){
    const params = [id];
    const text = `
      SELECT * FROM permissions_requests
      WHERE
        revision IN (SELECT max(revision) From permissions_requests WHERE permission_request_id = $1)
        AND permission_request_id = $1
    `;
    return await pg.query(text, params);
  }

  async create(data){
    let text = 'INSERT INTO permissions_requests(';
    let props = [
      'onboardingRequestId', 'permissionRequestId', 'iamId', 'rtTicketId',
      'needsSupervisorApproval', 'hasSupervisorApproval',
      'revision', 'permissions', 'notes', 'additionalData', 'submittedBy'
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

  async setRtId(id, rtId){
    const text = `
      UPDATE permissions_requests SET rt_ticket_id=$2 WHERE id=$1 RETURNING id
    `;
    return await pg.query(text, [id, rtId]);
  }

  getNextPermissionId(){
    const text = `
      SELECT nextval('permission_request_id')
    `;
    return pg.query(text);
  }

  /**
   * @description Returns most recent permissions draft for specified permission request
   * @param {String} submitter - User Id (kerberos)
   * @param {String} requestType - 'update' or 'onboarding'
   * @returns {Object} - {err, res}
   */
  getAllBySubmitter(submitter, requestType='update'){
    let idField;
    if ( requestType === 'onboarding' ){
      idField = 'onboarding_request_id';
    } else {
      idField = 'permission_request_id';
    }
    const text = `
      SELECT p.* FROM permissions_requests as p
      WHERE
        p.${idField} IN (
          SELECT ${idField} FROM permissions_requests
            WHERE
              submitted_by=$1 AND
              ${idField} IS NOT NULL
            GROUP BY ${idField}
        ) AND
        p.revision IN (SELECT max(revision) From permissions_requests WHERE ${idField} = p.${idField})
      ORDER BY p.submitted DESC
    `;
    return pg.query(text, [submitter]);
  }

  /**
   * @description Delete a permissions request by id
   * @param {Number} id - Unique identifier of request
   * @returns
   */
   async delete(id){
    if ( !id ) id = 0;
    const text = `
      DELETE FROM permissions_requests WHERE id=$1 RETURNING id
    `;
    return await pg.query(text, [id]);
  }
}

export default new PermissionsRequests();
