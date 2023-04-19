// TODO: look through onboarding records and do status checks
// ie if iam account is missing, look up, and write to rt if found

import iamAdmin from "@ucd-lib/iam-support-lib/src/utils/admin.js";
import UcdlibOnboarding from "@ucd-lib/iam-support-lib/src/utils/onboarding.js";
import config from "./config.js";

function OnboardingStatusError(error) {
  this.error = error;
  this.message = "Error when checking status of onboarding records";
  }

// you need to be on staff vpn or on itis network to run this script 
export const run = async (logError) => {
  try {
    const logs = [];
    const activeRecords = await UcdlibOnboarding.query({isOpen: true});
    if ( activeRecords.err ) throw new OnboardingStatusError(activeRecords.err);
    for (const record of activeRecords.res.rows) {

      // check if the record needs to be resolved based on RT ticket status
      const resolvedStatus = await iamAdmin.resolveOnboardingRecord(record, {rtConfig: config.rt});
      if ( resolvedStatus.error ) throw resolvedStatus.message;
      logs.push(resolvedStatus);

      const ucdIamStatus = await iamAdmin.checkOnboardingUcdIamRecord(record, {ucdIamConfig: config.ucdIamApi, rtConfig: config.rt, sendRt: true});
      if ( ucdIamStatus.error ) throw ucdIamStatus.message;
      logs.push(ucdIamStatus);
    }

     for (const log of logs ) {
      console.log(log);
    }


  } catch (error) {
    if ( logError ) {
      throw error;
    } else {
      throw new OnboardingStatusError(error);
    }
    
  } 
}