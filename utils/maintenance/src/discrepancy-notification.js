import slack from './slack.js';
import config from "./config.js";
import { CronJob } from 'cron';
import UcdlibEmployees from "@ucd-lib/iam-support-lib/src/utils/employees.js";
import UcdlibJobs from "@ucd-lib/iam-support-lib/src/utils/jobs.js";

new CronJob(
	config.cron.discrepancyNotification,
	run,
	null,
	true,
	'America/Los_Angeles'
);

async function run() {
  let thisJob;
  try {
    thisJob = await UcdlibJobs.start('discrepancy-notification');
    // get recent notifications
    const notifications = await UcdlibEmployees.getActiveRecordDiscrepancyNotifications(config.slack.iamSyncCacheThreshold);
    if ( notifications.err ) throw notifications.err;

    // group notifications by reason
    const notificationsByType = {};
    notifications.res.rows.forEach(n => {
      if ( !notificationsByType[n.reason] ) notificationsByType[n.reason] = [];
      notificationsByType[n.reason].push(n);
    });

    // get reason labels and descriptions
    const reasons = {};
    Object.values(UcdlibEmployees.outdatedReasons).forEach(r => reasons[r.slug] = r);

    // build message
    let msg = '';
    const employeeRecords = {};
    for (const [reason, notifications] of Object.entries(notificationsByType)) {

      const meta = reasons[reason];
      msg += `*${meta ? meta.label : reason}*\n`;
      if ( meta ) msg += `_${meta.description}_\n`;

      for (const n of notifications) {
        let emp = employeeRecords[n.iam_id];
        if ( !emp ) {
          emp = await UcdlibEmployees.getById(n.iam_id, 'iamId');
          if ( emp.err ) throw emp.err;
          if ( !emp.res.rows.length ) {
            msg += `- \`${n.iam_id}\`  Employee record not found\n`;
          } else {
            emp = emp.res.rows[0];
            employeeRecords[n.iam_id] = emp;
            msg += `- \`${n.iam_id}\`  ${emp.first_name} ${emp.last_name} (${emp.user_id})\n`;
          }
        }
      }
      msg += '\n\n';
    }

    // send message
    if ( !msg ) {
      thisJob.end();
      return;
    }
    msg = `*App/Script*:Library IAM Database\n*${notifications.res.rows.length} IAM Record Discrepancies Found!*\n\n${msg}`;
    await slack.send(msg);
    thisJob.end();

  } catch (error) {
    console.error(error);
    thisJob.end({error: error.message});
    await slack.sendErrorNotification('Unable to send IAM discrepancy notifications to slack.', error);
  }

};
