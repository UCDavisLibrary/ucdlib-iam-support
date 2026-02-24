import {BaseModel} from '@ucd-lib/cork-app-utils';
import PermissionsService from '../services/PermissionsService.js';
import PermissionsStore from '../stores/PermissionsStore.js';

import clearCache from '../utils/clearCache.js';

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

  async create(data) {
    const res = await this.service.create(data);
    if ( res.state === 'loaded' ) {
      clearCache();
    }
    return res;
  }

  /**
   * @description get latest permissions submission by onboarding or update id
   * @param {Number} id - uid of the submission
   * @param {String} idType - 'onboarding' or 'update'
   * @returns
   */
  get(id, idType='onboarding') {
    return this.service.get(id, idType);
  }

  /**
   * @description Get all submitted permission requests (most recent version) made by current user
   * @returns
   */
  getOwn(){
    return this.service.getOwn();
  }

}

const model = new PermissionsModel();
export default model;
