import {BaseService} from '@ucd-lib/cork-app-utils';
import OnboardingStore from '../stores/OnboardingStore.js';

class OnboardingService extends BaseService {

  constructor() {
    super();
    this.store = OnboardingStore;
  }

}

const service = new OnboardingService();
export default service;