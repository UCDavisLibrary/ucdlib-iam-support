import BaseService from './BaseService.js';
import ConfigStore from '../stores/ConfigStore.js';

class ConfigService extends BaseService {

  constructor() {
    super();
    this.store = ConfigStore;
  }

  get baseUrl(){
    return `/api/config`;
  }

  async getOnboardingReminderSettings() {
    const id = 'onboarding-reminders';
    const store = this.store.data.onboardingReminderSettings;

    await this.checkRequesting(
      id, store,
      () => this.request({
        url : `${this.baseUrl}/onboarding-reminders`,
        checkCached : () => store.get(id),
        onUpdate : resp => this.store.set(
          {...resp, id},
          store
        )
      })
    );
    return store.get(id);
  }

  async updateOnboardingReminderSettings(settings) {
    const id = 'update-onboarding-reminders';
    const store = this.store.data.onboardingReminderSettings;

    await this.checkRequesting(
      id, store,
      () => this.request({
        url : `${this.baseUrl}/onboarding-reminders`,
        json: true,
        fetchOptions: {
          method: 'PUT',
          body: settings
        },
        onUpdate : resp => this.store.set(
          {...resp, id},
          store
        )
      })
    );
    return store.get(id);
  }

}

const service = new ConfigService();
export default service;
