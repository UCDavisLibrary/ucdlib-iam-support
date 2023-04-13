import UcdlibEmployees from "./employees.js";
import UcdlibOnboarding from "./onboarding.js";

/**
 * @classdesc Used to perform various admin operations for this application.
 */
class iamAdmin {
  constructor(){}

  async adoptEmployee(onboardingId, params={}){
    const forceAdoption = params.force || false;
    const doNotCommentOnRt = params.doNotCommentOnRt || false;

    // retrieve onboarding record
    if ( !onboardingId ) throw new Error('onboardingId is required');
    let onboardingRecord = await UcdlibOnboarding.getById(onboardingId);
    if ( onboardingRecord.err ) throw onboardingRecord.err;
    if ( !onboardingRecord.res.rows.length ) throw new Error(`No onboarding record found for id ${onboardingId}`);
    onboardingRecord = onboardingRecord.res.rows[0];
    console.log('onboardingRecord', onboardingRecord);
  }
}

export default new iamAdmin();