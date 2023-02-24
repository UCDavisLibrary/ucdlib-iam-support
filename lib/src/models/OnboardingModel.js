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

  async query(q) {
    const id = this.makeQueryString(q);
    let state = this.store.data.byQuery[id];
    try {
      if( state && state.state === 'loading' ) {
        await state.request;
      } else {
        await this.service.query(id);
      }
    } catch(e) {}
    return this.store.data.byQuery[id];
  }

  clearQueryCache(q){
    if ( q ) {
      const id = this.makeQueryString(q);
      if ( this.store.data.byQuery[id] ) {
        delete this.store.data.byQuery[id];
      }
    } else {
      this.store.data.byQuery = {};
    }
  }

  makeQueryString(q){
    if ( !q || !Object.keys(q).length) return 'all';
    const searchParams = new URLSearchParams(q);
    searchParams.sort();
    return searchParams.toString();
  }

}

const model = new OnboardingModel();
export default model;