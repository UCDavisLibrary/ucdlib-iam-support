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

  async queryByName(query){
    return this.service.queryByName(query);
  }

  async query(q={}) {
    return this.service.query(q);
  }

}

const model = new SeparationModel();
export default model;
