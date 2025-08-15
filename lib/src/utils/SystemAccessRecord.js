import onboarding from "./onboarding.js";

/**
 * @description Class to manage system access modification record keeping.
 */
class SystemAccessRecord {

  constructor(){
    this.access = [];
  }

  static systems = [
    { value: 'ucdlib-iam-db', label: 'UCD Library IAM Database' },
    { value: 'ucdlib-keycloak', label: 'UCD Library Keycloak' }
  ];
  get systems(){
    return SystemAccessRecord.systems;
  }

  static onboardingRecordProp = 'addedToSystems';
  get onboardingRecordProp(){
    return SystemAccessRecord.onboardingRecordProp;
  }


  /**
   * @description Add a system access modification record.
   * @param {String} systemValue - A value from systems property.
   * @param {Object|String} opts - Options for the access record.
   *   If a string is provided, it will be used as the 'by' property
   */
  add(systemValue, opts){

    const system = this.systems.find(s => s.value === systemValue);
    if ( !system ) {
      throw new Error(`SystemAccessRecord: Invalid system value "${systemValue}"`);
    }

    if ( typeof opts === 'string' ) {
      opts = { by: opts };
    }
    opts = opts || {};
    this.access.push({
      value: system.value,
      label: system.label,
      by: opts.by,
      datetime: opts.datetime || new Date().toISOString()
    });
  }

  /**
   * @description Write the access records to the onboarding request.
   * @param {Number} onboardingRequestId - The id of the onboarding request to write to.
   * @returns {Promise}
   */
  async writeToOnboardingRequest(onboardingRequestId){
    if ( !onboardingRequestId ) {
      throw new Error('SystemAccessRecord: onboardingRequestId is required to save access records');
    }

    if ( !this.access.length ) {
      return;
    }

    // ensure the access record exists in the database
    const existing = await onboarding.getById(onboardingRequestId);
    if ( existing.err ) {
      throw new Error(`SystemAccessRecord: Failed to retrieve onboarding request with id ${onboardingRequestId}`);
    }

    if ( !existing.res.rowCount ) {
      throw new Error(`SystemAccessRecord: No onboarding request found with id ${onboardingRequestId}`);
    }

    const additionalData = existing.res?.rows[0].additional_data || {};

    additionalData[this.onboardingRecordProp] = additionalData[this.onboardingRecordProp] || [];
    additionalData[this.onboardingRecordProp].push(...this.access);

    await onboarding.update(onboardingRequestId, {additionalData});
  }

}

export default SystemAccessRecord;
