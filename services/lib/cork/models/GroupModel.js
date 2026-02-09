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

  /**
   * @description Returns all active groups
   * @returns {Array}
   */
    async getById(id){
      let state = this.store.data.groupById;
      try {
        if ( state.state === 'loading' ){
          await state.request
        } else {
          await this.service.getById(id);
        }
      } catch(e) {}
      return this.store.data.groupById;
    }

  /**
   * @description set group head
   * @returns {Array}
   */
    async setGroupHead(id, payload){

        let state = this.store.data.setGroupHead;
        try {
          if ( state.state === 'loading' ){
            await state.request
          } else {
            await this.service.setGroupHead(id, payload);
          }
        } catch(e) {}
        return this.store.data.setGroupHead;
      }

  /**
   * @description remove group head
   * @returns {Array}
   */
     async removeGroupHead(id, payload={}){
      let state = this.store.data.removeGroupHead;
      try {
        if ( state.state === 'loading' ){
          await state.request
        } else {
          await this.service.removeGroupHead(id, payload);
        }
      } catch(e) {}
      return this.store.data.removeGroupHead;
    }
    
  /**
   * @description Clears cache for group id
   * @param {String} id - Group id - if excluded, will clear cache for all
   */
  clearGroupIDCache(){
    this.store.data.groupById = {};

  }

}

const model = new GroupModel();
export default model;
