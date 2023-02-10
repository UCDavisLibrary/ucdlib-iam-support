import {BaseStore} from '@ucd-lib/cork-app-utils';

class OnboardingStore extends BaseStore {

  constructor() {
    super();

    this.data = {};
    this.events = {};
  }

}

const store = new OnboardingStore();
export default store;