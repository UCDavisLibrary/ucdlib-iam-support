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

  async newSubmission(payload){
    const now = (new Date()).toISOString();
    try {
      await this.service.newSubmission(now, payload);
    } catch (error) {
      
    }
    return this.store.data.newSubmissions[now];
  }

  async getById(id) {
    let state = this.store.data.byId[id];
    try {
      if( state && state.state === 'loading' ) {
        await state.request;
      } else {
        await this.service.getById(id);
      }
    } catch(e) {}
    return this.store.data.byId[id];
  }

}

const model = new OnboardingModel();
export default model;