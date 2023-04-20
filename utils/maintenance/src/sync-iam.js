import slack from './slack.js';
import { CronJob } from 'cron';
import config from "./config.js";
import { run as syncEmployees } from './iam-employee.js';
import { run as syncKeycloak } from './keycloak-sync.js';
import { run as checkOnboardingRecords } from './check-onboarding-records.js';

new CronJob(
	config.cron.iamSync, 
	run,
	null,
	true,
	'America/Los_Angeles'
);

// master function for running all syncs
async function run() {
  try {
    console.log('Syncing employee data with UCD IAM...');
    await syncEmployees();

    console.log('Syncing employee data with keycloak...');
    await syncKeycloak();

    console.log('Checking onboarding records against RT and UCD IAM...');
    await checkOnboardingRecords();
    
  } catch (error) {
    console.error(error.message);
    console.error(error.error);
    try {
      slack.sendErrorNotification(error.message, error.error);
    } catch (error) {
      console.error('Error sending slack notification');
      console.error(error);
    }
    
  }
}
