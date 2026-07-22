/**
 * @typedef {Object} OnboardingReminderInterval
 * @property {String} slug - Stable identifier, used as the key in additional_data.onboardingReminders.sent and in admin settings
 * @property {String} label - Admin-facing heading shown in the settings UI (e.g. "First Six Months")
 * @property {String} phrase - Natural-language phrase used in the email body's {{interval}} slot (e.g. "their first six months")
 * @property {String} sqlInterval - Postgres interval string, e.g. '14 days', '3 months' - how long after start_date this reminder is due
 */

/**
 * @description Definitions for onboarding checklist reminder email intervals
 */
class OnboardingReminderUtils {
  constructor(){
    /** @description meta_key in the config table under which admin-editable settings (fromEmail + per-interval disable/checklist) are stored */
    this.settingsKey = 'onboarding_reminders_settings';

    /** @type {Array<OnboardingReminderInterval>} */
    this.intervals = [
      {
        slug: 'firstDayWeek',
        label: 'First Day/First Week',
        phrase: 'their first day/week',
        sqlInterval: '0 days' 
      },
      { 
        slug: 'firstMonth',
        label: 'First Month',
        phrase: 'their first month',
        sqlInterval: '14 days' 
      },
      { 
        slug: 'firstSixMonths',
        label: 'First Six Months',
        phrase: 'their first six months',
        sqlInterval: '3 months'
      },
      { 
        slug: 'firstYear',
        label: 'First Year',
        phrase: 'their first year',
        sqlInterval: '6 months'
      }
    ];
  }
}

export default new OnboardingReminderUtils();
