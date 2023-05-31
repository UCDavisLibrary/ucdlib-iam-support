/**
 * @class OnboardingIsoUtils
 * @description Isomorphic utility functions for onboarding records
 */
class OnboardingIsoUtils {

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
    if ( !this.record.additionalData ) return false;
    const fields = ['employeeEmail', 'employeeUserId', 'employeeId'];
    for ( const field of fields ) {
      if ( this.record.additionalData[field] ) return true;
    }
    return false;
  }

}

export default OnboardingIsoUtils;
