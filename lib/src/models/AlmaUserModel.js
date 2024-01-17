import {BaseModel} from '@ucd-lib/cork-app-utils';
import AlmaUserService from '../services/AlmaUserService.js';
import AlmaUserStore from '../stores/AlmaUserStore.js';

class AlmaUserModel extends BaseModel {

  constructor() {
    super();

    this.store = AlmaUserStore;
    this.service = AlmaUserService;
      
    this.register('AlmaUserModel');
  }

  /**
   * @description Returns all active groups
   * @returns {Array}
   */
   async getAlmaUserRoleType(){
    let state = this.store.data.roleType;
    try {
      if ( state.state === 'loading' ){
        await state.request
      } else {
        await this.service.getAlmaUserRoleType();
      }
    } catch(e) {}
    return this.store.data.roleType;
  }


  async getAlmaUserById(id, idType='almaId', event='search'){
    if ( !id ) {
      console.warn('id is a required argument');
    }
    try {
      await this.service.getAlmaUserById(id, idType, event);
    } catch(e) {}
    return this.store.data[idType][id];

  }

  async getAlmaUserByIds(ids, event='search'){
    if ( !ids ) {
      console.warn('id is a required argument');
    }
    try {
      await this.service.getAlmaUserByIds(ids, event);
    } catch(e) {}
    return this.store.data.bulk[ids];

  }

  /**
   * @description Searches for a users by name
   * @param {String} last - Last Name
   * @param {String} first - First Name
   * @returns Array of users or error object
   */
   async getAlmaUserByName(last, first){
    try {
      await this.service.getAlmaUserByName(last, first);
    } catch(e) {}
    const key = this.service._makeNameQuery(last, first).toString();
    const response = this.store.data.name[key];
    return response
  }

}

const model = new AlmaUserModel();
export default model;