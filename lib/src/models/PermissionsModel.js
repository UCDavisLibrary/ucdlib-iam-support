import {BaseModel} from '@ucd-lib/cork-app-utils';
import PermissionsService from '../services/PermissionsService.js';
import PermissionsStore from '../stores/PermissionsStore.js';

/**
 * @class PermissionsModel
 * @description Centralized state management for library permissions data retrieved from local db via api.
 */
class PermissionsModel extends BaseModel {

  constructor() {
    super();

    this.store = PermissionsStore;
    this.service = PermissionsService;

    this.register('PermissionsModel');
  }

  /**
   * @description Create a new permissions submission
   * @param {Object} payload
   * @returns
   */
  async newSubmission(payload){
    const now = (new Date()).toISOString();
    try {
      await this.service.newSubmission(now, payload);
    } catch (error) {

    }
    return this.store.data.submissions[now];
  }

  /**
   * @description get latest permissions submission by onboarding or update id
   * @param {Number} id - uid of the submission
   * @param {String} idType - 'onboarding' or 'update'
   * @returns
   */
  async getById(id, idType='onboarding') {
    let state = this.store.data.byId[idType][id];
    try {
      if( state && state.state === 'loading' ) {
        await state.request;
      } else {
        await this.service.getById(id, idType);
      }
    } catch(e) {}
    this.store.emit(this.store.events.PERMISSIONS_RECORD_REQUEST, this.store.data.byId[idType][id]);
    return this.store.data.byId[idType][id];
  }

  /**
   * @description Get all submitted permission requests (most recent version) made by current user
   * @returns
   */
  async ownUpdateList(){
    let state = this.store.data.ownUpdateList;
    try {
      if( state && state.state === 'loading' ) {
        await state.request;
      } else {
        await this.service.ownUpdateList();
      }
    } catch(e) {}
    return this.store.data.ownUpdateList;
  }

  /**
   * @description Clear permissions submission cache
   * @param {Number} id - uid of the submission, if not provided, clear all
   * @param {String} idType - 'onboarding' or 'update', if not provided, clear all
   */
  clearIdCache(id, idType){
    if ( id && idType){
      if ( this.store.data.byId[idType][id] ) {
        delete this.store.data.byId[idType][id];
      }
    else if ( idType ){
      this.store.data.byId[idType] = {};
    }
    } else {
      this.store.data.byId = {
        onboarding: {},
        update: {}
      };
    }
  }

  /**
   * @description Clear ownUpdateList cache
   */
  clearOwnUpdateListCache(){
    this.store.data.ownUpdateList = {};
  }

}

const model = new PermissionsModel();
export default model;
