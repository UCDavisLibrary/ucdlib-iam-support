import {BaseModel} from '@ucd-lib/cork-app-utils';
import PermissionsService from '../services/PermissionsService.js';
import PermissionsStore from '../stores/PermissionsStore.js';

class PermissionsModel extends BaseModel {

  constructor() {
    super();

    this.store = PermissionsStore;
    this.service = PermissionsService;

    this.register('PermissionsModel');
  }

  async newSubmission(payload){
    const now = (new Date()).toISOString();
    try {
      await this.service.newSubmission(now, payload);
    } catch (error) {

    }
    return this.store.data.submissions[now];
  }

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

  clearOwnUpdateListCache(){
    this.store.data.ownUpdateList = {};
  }

}

const model = new PermissionsModel();
export default model;
