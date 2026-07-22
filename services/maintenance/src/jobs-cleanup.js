import { CronJob } from 'cron';

import models from "#models";
import config from "#lib/utils/config.js";

new CronJob(
	config.cron.jobsCleanup,
	run,
	null,
	true,
	'America/Los_Angeles'
);

/**
 * @description Delete jobs (and their job_logs) that ended more than config.jobs.retentionInterval ago
 */
export async function run() {
  let thisJob;
  try {
    const startResult = await models.jobs.start('jobs-cleanup');
    if ( startResult.job ) thisJob = startResult.job;

    const r = await models.jobs.deleteOld();
    if ( r.err ) throw r.err;

    const { deletedJobs, deletedJobLogs } = r.res.rows[0];
    if ( thisJob ) await thisJob.end({
      retentionInterval: config.jobs.retentionInterval,
      deletedJobs: Number(deletedJobs),
      deletedJobLogs: Number(deletedJobLogs)
    });
  } catch (error) {
    console.error(error);
    if ( thisJob ) {
      await thisJob.end({error: error.message}, false);
    }
  }
}
