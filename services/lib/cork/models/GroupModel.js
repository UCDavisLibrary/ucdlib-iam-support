import {BaseModel} from '@ucd-lib/cork-app-utils';
import GroupService from '../services/GroupService.js';
import GroupStore from '../stores/GroupStore.js';

import clearCache from '../utils/clearCache.js';

/**
 * @class GroupModel
 * @description Centralized state management for library groups (departments, units, etc) retrieved from local db via api.
 */
class GroupModel extends BaseModel {

  constructor() {
    super();

    this.store = GroupStore;
    this.service = GroupService;

    this.register('GroupModel');
  }

  /**
   * @description Returns all groups
   */
  list(){
    return this.service.list();
  }

  /**
   * @description Get group by id
   */
  get(id){
    return this.service.get(id);
  }

  /**
   * @description Set group head
   * @param {Number} id - group id
   * @param {Object} payload - request body, should include employeeRowID of new head
   * @returns 
   */
  async setHead(id, payload){
    const res = await this.service.setHead(id, payload);
    if ( res.state === 'loaded' ) {
      clearCache();
    }
    return res;
  }

  /**
   * @description Remove group head
   * @param {Number} id - group id
   * @returns 
   */
  async removeHead(id){
    const res = await this.service.removeHead(id);
    if ( res.state === 'loaded' ) {
      clearCache();
    }
    return res;
  }

}

const model = new GroupModel();
export default model;
