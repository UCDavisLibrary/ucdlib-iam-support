import {BaseModel} from '@ucd-lib/cork-app-utils';
import GroupService from '../services/GroupService.js';
import GroupStore from '../stores/GroupStore.js';

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
   * @description Returns all active groups
   * @returns {Array}
   */
  async getAll(){
    let state = this.store.data.groups;
    try {
      if ( state.state === 'loading' ){
        await state.request
      } else {
        await this.service.getGroups();
      }
    } catch(e) {}
    return this.store.data.groups;
  }

}

const model = new GroupModel();
export default model;
