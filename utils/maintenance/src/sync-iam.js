import slack from './slack.js';
import { CronJob } from 'cron';
import config from "./config.js";
import { run as syncEmployees } from './iam-employee.js';

new CronJob(
	config.cron.iamSync, 
	run,
	null,
	true,
	'America/Los_Angeles'
);

async function run() {
  try {
    await syncEmployees();  
  } catch (error) {
    console.error(error.message);
    console.error(error.error);
    slack.sendErrorNotification(error.message, error.error);
  }
}
