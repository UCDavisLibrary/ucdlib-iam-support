import { CronJob } from 'cron';
import models from "#models";
import config from "#lib/utils/config.js";
import mailer from "#lib/utils/mailer.js";
import RequestsIsoUtils from "#lib/utils/requests-iso-utils.js";
import onboardingReminderUtils from "#lib/utils/onboarding-reminder-utils.js";

new CronJob(
	config.cron.onboardingReminders,
	run,
	null,
	true,
	'America/Los_Angeles'
);

/**
 * @description Send onboarding checklist reminder emails to supervisors, per onboardingReminderUtils.intervals
 */
export async function run() {
  let thisJob;
  const counts = { checked: 0, sent: 0, skipped: 0, errors: 0 };
  try {
    const startResult = await models.jobs.start('send-onboarding-reminders');
    if ( startResult.job ) thisJob = startResult.job;

    const settings = await models.config.getJson(onboardingReminderUtils.settingsKey, {fromEmail: '', intervals: {}});

    for ( const interval of onboardingReminderUtils.intervals ) {
      const intervalSettings = settings.intervals?.[interval.slug];
      if ( intervalSettings?.disabled ) continue;

      const { res, err } = await models.onboarding.getDueForReminder(interval.slug);
      if ( err ) throw err;

      for ( const request of res.rows ) {
        counts.checked++;

        try {
          // Skip for firstDayWeek - the employee may not be provisioned into the local
          // employees table yet this early, so a missing lookup here doesn't mean they've departed.
          if ( interval.slug !== 'firstDayWeek' ) {
            const employeeLookup = await models.employees.getById(request.iam_id, 'iamId');
            if ( !employeeLookup.res?.rows?.length ) {
              const additionalData = {
                ...request.additional_data,
                onboardingReminders: { ...request.additional_data.onboardingReminders, optOut: true }
              };
              await models.onboarding.update(request.id, {additionalData});
              if ( thisJob ) await thisJob.log(`Employee ${request.iam_id} no longer exists - disabling future reminders for onboarding request ${request.id}`);
              continue;
            }
          }

          const result = await sendReminder(request, interval, intervalSettings, settings);
          if ( result.sent ) {
            const sent = request.additional_data?.onboardingReminders?.sent || {};
            const additionalData = {
              ...request.additional_data,
              onboardingReminders: {
                ...request.additional_data.onboardingReminders,
                sent: { ...sent, [interval.slug]: new Date().toISOString() }
              }
            };
            await models.onboarding.update(request.id, {additionalData});
            counts.sent++;
            if ( thisJob ) await thisJob.log(`Sent ${interval.slug} reminder for onboarding request ${request.id}`);
          } else {
            counts.skipped++;
            if ( thisJob ) await thisJob.log(`Did not send ${interval.slug} reminder for onboarding request ${request.id}: ${result.reason}`);
          }
        } catch (sendError) {
          counts.errors++;
          console.error(`Error sending ${interval.slug} reminder for request ${request.id}`, sendError);
          if ( thisJob ) await thisJob.log(`Error sending ${interval.slug} reminder for request ${request.id}: ${sendError.message}`);
        }
      }
    }

    if ( thisJob ) await thisJob.end(counts);
  } catch (error) {
    console.error(error);
    if ( thisJob ) await thisJob.end({...counts, error: error.message}, false);
  }
}

/**
 * @description Send a single reminder email for one onboarding request/interval, if configured and possible
 * @returns {Object} {sent: Boolean, reason: String} - reason is only set when sent is false
 */
async function sendReminder(request, interval, intervalSettings, settings) {
  if ( !intervalSettings?.checklistLink || !intervalSettings?.checklistName ) {
    return { sent: false, reason: `Checklist not configured for interval ${interval.slug}` };
  }

  let supervisorEmail = request.additional_data?.supervisorEmail;
  let supervisorFirstName = request.additional_data?.supervisorFirstName;
  if ( request.supervisor_id ) {
    const lookup = await models.employees.getById(request.supervisor_id, 'iamId');
    const supervisor = lookup.res?.rows?.[0];
    if ( supervisor ) {
      supervisorEmail = supervisor.email;
      supervisorFirstName = supervisor.first_name;
    }
  }
  if ( !supervisorEmail ) {
    return { sent: false, reason: 'No supervisor email available' };
  }

  const employeeName = new RequestsIsoUtils(request).employeeFullName || 'the new employee';
  const subject = `${intervalSettings.checklistName} (${employeeName})`;
  const text = [
    `Hi ${supervisorFirstName || 'there'},`,
    '',
    `As ${employeeName} reaches ${interval.phrase} with the UC Davis Library, please review and complete the onboarding checklist linked below.`,
    '',
    `As the employee's supervisor, you play a key role in ensuring a successful onboarding experience. The checklist outlines the recommended conversations and activities to support your employee's onboarding and engagement. Completing these items helps ensure a consistent, well-coordinated onboarding experience and sets new employees up for success throughout their first year.`,
    '',
    `${intervalSettings.checklistName}: ${intervalSettings.checklistLink}`,
    '',
    'If you have any questions about the onboarding process or your responsibilities, please contact Library HR (libraryhr@ucdavis.edu).',
    '',
    'Thank you for your partnership in creating a successful onboarding experience.'
  ].join('\n');

  const result = await mailer.send({to: supervisorEmail, from: settings.fromEmail || undefined, subject, text});
  if ( result.success ) return { sent: true };
  if ( result.skipped ) return { sent: false, reason: result.reason };
  return { sent: false, reason: `Mailer error: ${result.error?.message || 'unknown error'}` };
}
