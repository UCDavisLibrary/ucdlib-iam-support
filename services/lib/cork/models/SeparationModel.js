import {BaseModel} from '@ucd-lib/cork-app-utils';
import SeparationService from '../services/SeparationService.js';
import SeparationStore from '../stores/SeparationStore.js';

import clearCache from '../utils/clearCache.js';

class SeparationModel extends BaseModel {

  constructor() {
    super();

    this.store = SeparationStore;
    this.service = SeparationService;

    this.register('SeparationModel');
  }

  async create(data) {
    const res = await this.service.create(data);
    if ( res.state === 'loaded' ) {
      clearCache();
    }
    return res;
  }

  async get(separationId) {
    const res = await this.service.get(separationId);
    return res;
  }


  async deprovision(separationId) {
    const res = await this.service.deprovision(separationId);
    if ( res.state === 'loaded' ) {
      clearCache();
    }
    return res;
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

  async query(q={}) {
    return this.service.query(q);
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
