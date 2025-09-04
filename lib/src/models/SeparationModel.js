import {BaseModel} from '@ucd-lib/cork-app-utils';
import SeparationService from '../services/SeparationService.js';
import SeparationStore from '../stores/SeparationStore.js';

class SeparationModel extends BaseModel {

  constructor() {
    super();

    this.store = SeparationStore;
    this.service = SeparationService;

    this.register('SeparationModel');
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
    this.store.emit(this.store.events.SEPARATION_SUBMISSION_REQUEST, this.store.data.byId[id]);
    return this.store.data.byId[id];
  }

  async deprovision(id) {
    let state = this.store.data.deprovision[id];
    try {
      if( state && state.state === 'loading' ) {
        await state.request;
      } else {
        await this.service.deprovision(id);
      }
    } catch(e) {}
    return this.store.data.deprovision[id];
  }

  async changeById(id, q={}) {
    const query = this.makeQueryString(q);
    let state = this.store.data.byChangeId[id];
    try {
      if( state && state.state === 'loading' ) {
        await state.request;
      } else {
        await this.service.changeById(id, query);
      }
    } catch(e) {}
    return this.store.data.byChangeId[id];
  }


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

  clearIdCache(id){
    if ( id ){
      if ( this.store.data.byId[id] ) {
        delete this.store.data.byId[id];
      }
    } else {
      this.store.data.byId = {};
    }
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

const model = new SeparationModel();
export default model;
