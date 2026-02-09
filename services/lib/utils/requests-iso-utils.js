/**
 * @class RequestsIsoUtils
 * @description Isomorphic utility functions for onboarding and separation requests
 */
class RequestsIsoUtils {

  constructor(record) {
    this.record = record;
  }

  /**
   * @description The record has at least one unique identifier for the employee
   * @returns {Boolean}
   */
  hasUniqueIdentifier() {
    if ( !this.record ) return false;
    if ( this.record.iam_id || this.record.iamId ) return true;
    if ( !this.record.additionalData && !this.record.additional_data ) return false;
    const ad = this.record.additionalData || this.record.additional_data;
    const fields = ['employeeEmail', 'employeeUserId', 'employeeId'];
    for ( const field of fields ) {
      if ( ad[field] ) return true;
    }
    return false;
  }

  static get statusCodes() {
    return {
      'submitted': 1,
      'supervisor': 2,
      'iamRecord': 3,
      'userId': 4,
      'provisioning': 5,
      'resolving': 6,
      'resolved': 7,
      'missingUid': 9
    };
  }

}

export default RequestsIsoUtils;
