import {BaseStore, LruStore} from '@ucd-lib/cork-app-utils';

class OnboardingStore extends BaseStore {

  constructor() {
    super();

    this.data = {
      query: new LruStore({name: 'onboarding.query'}),
      byName: new LruStore({name: 'onboarding.byName'}),
      get: new LruStore({name: 'onboarding.get'}),
      create: new LruStore({name: 'onboarding.create'}),
      reconciliation: new LruStore({name: 'onboarding.reconciliation'}),
      backgroundCheck: new LruStore({name: 'onboarding.backgroundCheck'}),
      adopt: new LruStore({name: 'onboarding.adopt'})
    };
    this.events = {};
  }
}

const store = new OnboardingStore();
export default store;
