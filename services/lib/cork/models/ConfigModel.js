import {BaseModel} from '@ucd-lib/cork-app-utils';
import ConfigService from '../services/ConfigService.js';
import ConfigStore from '../stores/ConfigStore.js';

/**
 * @class ConfigModel
 * @description Centralized state management for app-wide configuration stored in the config table
 */
class ConfigModel extends BaseModel {

  constructor() {
    super();

    this.store = ConfigStore;
    this.service = ConfigService;

    this.register('ConfigModel');
  }

  /**
   * @description Get onboarding checklist reminder email settings
   */
  getOnboardingReminderSettings() {
    return this.service.getOnboardingReminderSettings();
  }

  /**
   * @description Update onboarding checklist reminder email settings
   * @param {Object} settings
   */
  updateOnboardingReminderSettings(settings) {
    return this.service.updateOnboardingReminderSettings(settings);
  }

}

const model = new ConfigModel();
export default model;
