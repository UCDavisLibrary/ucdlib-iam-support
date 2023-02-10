import {BaseModel} from '@ucd-lib/cork-app-utils';
import OnboardingService from '../services/OnboardingService.js';
import OnboardingStore from '../stores/OnboardingStore.js';

class OnboardingModel extends BaseModel {

  constructor() {
    super();

    this.store = OnboardingStore;
    this.service = OnboardingService;
      
    this.register('OnboardingModel');
  }

}

const model = new OnboardingModel();
export default model;