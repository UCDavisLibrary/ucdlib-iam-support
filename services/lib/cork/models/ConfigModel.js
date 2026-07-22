import {BaseModel} from '@ucd-lib/cork-app-utils';
import ConfigService from '../services/ConfigService.js';
import ConfigStore from '../stores/ConfigStore.js';

import clearCache from '../utils/clearCache.js';

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
  async updateOnboardingReminderSettings(settings) {
    const res = await this.service.updateOnboardingReminderSettings(settings);
    if ( res.state === 'loaded' ) {
      clearCache();
    }
    return res;
  }

}

const model = new ConfigModel();
export default model;
