import models from '#models';
import onboardingReminderUtils from '#lib/utils/onboarding-reminder-utils.js';
import handleError from './handleError.js';

function defaultOnboardingReminderSettings(){
  const intervals = {};
  onboardingReminderUtils.intervals.forEach(i => intervals[i.slug] = {disabled: false, checklistName: '', checklistLink: ''});
  return { fromEmail: '', intervals };
}

export default (api) => {

  /**
   * @description Get onboarding checklist reminder email settings
   */
  api.get('/config/onboarding-reminders', async (req, res) => {
    try {
      if ( !req.auth.token.hasAdminAccess && !req.auth.token.hasHrAccess ){
        return res.status(403).json({error: true, message: 'Not authorized to access this resource.'});
      }
      const settings = await models.config.getJson(onboardingReminderUtils.settingsKey, defaultOnboardingReminderSettings());
      res.json({
        intervals: onboardingReminderUtils.intervals.map(i => ({slug: i.slug, label: i.label})),
        settings
      });

    } catch (e) {
      return handleError(res, req, e);
    }
  });

  /**
   * @description Update onboarding checklist reminder email settings
   */
  api.put('/config/onboarding-reminders', async (req, res) => {
    try {
      if ( !req.auth.token.hasAdminAccess && !req.auth.token.hasHrAccess ){
        return res.status(403).json({error: true, message: 'Not authorized to access this resource.'});
      }
      const body = req.body || {};
      const settings = { fromEmail: (body.fromEmail || '').trim(), intervals: {} };
      onboardingReminderUtils.intervals.forEach(i => {
        const incoming = body.intervals?.[i.slug] || {};
        settings.intervals[i.slug] = {
          disabled: !!incoming.disabled,
          checklistName: (incoming.checklistName || '').trim(),
          checklistLink: (incoming.checklistLink || '').trim()
        };
      });
      const r = await models.config.setJson(onboardingReminderUtils.settingsKey, settings);
      if ( r.err ) {
        console.error(r.err);
        return res.status(500).json({error: true, message: 'Unable to save settings'});
      }
      res.json({settings});

    } catch (e) {
      return handleError(res, req, e);
    }
  });
};
