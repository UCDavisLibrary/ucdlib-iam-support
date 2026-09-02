import {BaseStore, LruStore} from '@ucd-lib/cork-app-utils';

class ConfigStore extends BaseStore {

  constructor() {
    super();

    this.data = {
      onboardingReminderSettings: new LruStore({name: 'config.onboardingReminderSettings'})
    };
    this.events = {};
  }
}

const store = new ConfigStore();
export default store;
