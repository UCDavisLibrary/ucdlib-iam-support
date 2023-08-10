import iamAdmin from "@ucd-lib/iam-support-lib/src/utils/admin.js";
import UcdlibSeparation from "@ucd-lib/iam-support-lib/src/utils/separation.js";
import UcdlibJobs from "@ucd-lib/iam-support-lib/src/utils/jobs.js";
import config from "./config.js";

function SeparationStatusError(error) {
  this.error = error;
  this.message = "Error when checking status of separation records";
  }

/**
 * @description Reviews all active separation records and
 * - checks if the RT ticket has been resolved, in which case the status is updated
 * - sends reminder comment on separation date
 * @param {Boolean} logError - if true, will simply throw an error instead of sending message to slack
 * @param {Boolean} saveToDB - if true, will save a record of the run to the jobs table
 */
export const run = async (logError, saveToDB) => {
  let thisJob;
  try {
    if ( saveToDB ) {
      const r = await UcdlibJobs.start('check-separation-records');
      if ( r.job ) thisJob = r.job;
    }
    const logs = [];
    const activeRecords = await UcdlibSeparation.query({isOpen: true});
    if ( activeRecords.err ) throw new SeparationStatusError(activeRecords.err);
    for (const record of activeRecords.res.rows) {
      const resolvedStatus = await iamAdmin.resolveSeparationRecord(record, {rtConfig: config.rt});
      if ( resolvedStatus.log?.error ) throw resolvedStatus.log.message;
      logs.push(resolvedStatus.log);
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
      throw new SeparationStatusError(error);
    }

  }
}
