import {BaseModel} from '@ucd-lib/cork-app-utils';
import OnboardingService from '../services/OnboardingService.js';
import OnboardingStore from '../stores/OnboardingStore.js';

import clearCache from '../utils/clearCache.js';

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
  async create(data) {
    const res = await this.service.create(data);
    if ( res.state === 'loaded' ) {
      clearCache();
    }
    return res;
  }

  /**
   * @description Match an existing onboarding request to a UC Davis employee record
   * @param {Number} onboardingId - the id of the onboarding request
   * @param {String} iamId - the id of the employee record from UCD IAM API
   * @returns
   */
  async reconcile(onboardingId, iamId) {
    const res = await this.service.reconcile(onboardingId, iamId);
    if ( res.state === 'loaded' ) {
      clearCache();
    }
    return res;
  }

  /**
   * @description Adopt an employee into the library IAM system based on their onboarding request
   * @param {Number} onboardingId - the id of the onboarding request
   * @returns
   */
  async adoptEmployee(onboardingId) {
    const res = await this.service.adoptEmployee(onboardingId);
    if ( res.state === 'loaded' ) {
      clearCache();
    }
    return res;
  }

  /**
   * @description Send RT notification about completing background check
   * @param {Number} onboardingId - the id of the onboarding request
   * @param {Object} payload - Settings for the RT notification(s)
   * @returns
   */
  async sendBackgroundCheckNotification(onboardingId, payload) {
    const res = await this.service.backgroundCheck(onboardingId, payload);
    if ( res.state === 'loaded' ) {
      clearCache();
    }
    return res;
  }

  get(onboardingId) {
    return this.service.get(onboardingId);
  }

  /**
   * @description Search for existing onboarding submissions by name
   * @param {Object} query - query parameters with names to search for
   */
  async queryByName(query){
    return this.service.queryByName(query);
  }

  /**
   * @description Query for existing onboarding submissions
   * @param {Object} q - query parameters - see api docs for details
   * @returns
   */
  async query(q={}) {
    return this.service.query(q);
  }

}

const model = new OnboardingModel();
export default model;
