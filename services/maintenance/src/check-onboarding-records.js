import models from '#models';

import config from "#lib/utils/config.js";

function OnboardingStatusError(error) {
  this.error = error;
  this.message = "Error when checking status of onboarding records";
  }

/**
 * @description Reviews all active onboarding records and
 * - checks if the RT ticket has been resolved, in which case the status is updated
 * - checks if the employee's UCD IAM record has been created, in which case the status is updated
 * @param {Boolean} logError - if true, will simply throw an error instead of sending message to slack
 * @param {Boolean} saveToDB - if true, will save a record of the run to the jobs table
 */
export const run = async (logError, saveToDB) => {
  let thisJob;
  try {
    if ( saveToDB ) {
      const r = await models.jobs.start('check-onboarding-records');
      if ( r.job ) thisJob = r.job;
    }
    const logs = [];
    const activeRecords = await models.onboarding.query({isOpen: true});
    if ( activeRecords.err ) throw new OnboardingStatusError(activeRecords.err);
    for (const record of activeRecords.res.rows) {

      // check if the record needs to be resolved based on RT ticket status
      const resolvedStatus = await models.admin.resolveOnboardingRecord(record, {rtConfig: config.rt});
      if ( resolvedStatus.error ) throw resolvedStatus.message;
      logs.push(resolvedStatus);

      const ucdIamStatus = await models.admin.checkOnboardingUcdIamRecord(record, {ucdIamConfig: config.ucdIamApi, rtConfig: config.rt, sendRt: true});
      if ( ucdIamStatus.error ) throw ucdIamStatus.message;
      logs.push(ucdIamStatus);
    }

     for (const log of logs ) {
      console.log(log);
      if ( thisJob ) {
        await thisJob.log(log);
      }
    }

    if ( thisJob ) {
      const actionTakenCt = logs.filter(log => log.actionTaken).length;
      await thisJob.end({actionTakenCt});
    }


  } catch (error) {
    if ( thisJob ) {
      await thisJob.end({error: error.message}, false);
    }
    if ( logError ) {
      throw error;
    } else {
      throw new OnboardingStatusError(error);
    }

  }
}
