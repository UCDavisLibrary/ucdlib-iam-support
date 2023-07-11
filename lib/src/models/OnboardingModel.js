import {BaseModel} from '@ucd-lib/cork-app-utils';
import OnboardingService from '../services/OnboardingService.js';
import OnboardingStore from '../stores/OnboardingStore.js';

/**
 * @class OnboardingModel
 * @description Centralized state management for library onboarding data retrieved from local db via api.
 */
class OnboardingModel extends BaseModel {

  constructor() {
    super();

    this.store = OnboardingStore;
    this.service = OnboardingService;

    this.register('OnboardingModel');
  }

  /**
   * @description Create a new onboarding submission
   * @param {Object} payload
   * @returns
   */
  async newSubmission(payload){
    const now = (new Date()).toISOString();
    try {
      await this.service.newSubmission(now, payload);
    } catch (error) {

    }
    return this.store.data.newSubmissions[now];
  }

  /**
   * @description Match an existing onboarding request to a UC Davis employee record
   * @param {Number} onboardingId - the id of the onboarding request
   * @param {String} iamId - the id of the employee record from UCD IAM API
   * @returns
   */
  async reconcile(onboardingId, iamId) {
    let state = this.store.data.reconciliation[onboardingId];
    try {
      if( state && state.state === 'loading' ) {
        await state.request;
      } else {
        await this.service.reconcile(onboardingId, iamId);
      }
    } catch(e) {}
    return this.store.data.reconciliation[onboardingId];
  }

  /**
   * @description Send RT notification about completing background check
   * @param {Number} onboardingId - the id of the onboarding request
   * @param {Object} payload - Settings for the RT notification(s)
   * @returns
   */
  async sendBackgroundCheckNotification(onboardingId, payload) {
    let state = this.store.data.backgroundCheck[onboardingId];
    try {
      if( state && state.state === 'loading' ) {
        await state.request;
      } else {
        await this.service.backgroundCheck(onboardingId, payload);
      }
    } catch(e) {}
    return this.store.data.backgroundCheck[onboardingId];
  }

  /**
   * @description Retrieve a single onboarding submission by id
   * @param {Number} id - the id of the onboarding request
   * @returns
   */
  async getById(id) {
    let state = this.store.data.byId[id];
    try {
      if( state && state.state === 'loading' ) {
        await state.request;
      } else {
        await this.service.getById(id);
      }
    } catch(e) {}
    this.store.emit(this.store.events.ONBOARDING_SUBMISSION_REQUEST, this.store.data.byId[id]);
    return this.store.data.byId[id];
  }

  /**
   * @description Search for existing onboarding submissions by name
   * @param {Object} q - query parameters with names to search for
   */
  async recordSearch(q) {
    const id = this.makeQueryString(q);
    let state = this.store.data.byRecord[id];
    try {
      if( state && state.state === 'loading' ) {
        await state.request;
      } else {
        await this.service.recordSearch(id);
      }
    } catch(e) {}
    return this.store.data.byRecord.result;
  }

  /**
   * @description Clear cache of single onboarding requests
   * @param {Number} id - the id of the onboarding request, if not provided, clear all
   */
  clearIdCache(id){
    if ( id ){
      if ( this.store.data.byId[id] ) {
        delete this.store.data.byId[id];
      }
    } else {
      this.store.data.byId = {};
    }
  }

  /**
   * @description Query for existing onboarding submissions
   * @param {Object} q - query parameters - see api docs for details
   * @returns
   */
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

  /**
   * @description Clear cache of onboarding query results
   * @param {Object} q - query parameters, if not provided, clear all
   */
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

  /**
   * @description Create a sorted query string from an object
   * @param {Object} q - query parameters
   * @returns
   */
  makeQueryString(q){
    if ( !q || !Object.keys(q).length) return 'all';
    const searchParams = new URLSearchParams(q);
    searchParams.sort();
    return searchParams.toString();
  }

}

const model = new OnboardingModel();
export default model;
