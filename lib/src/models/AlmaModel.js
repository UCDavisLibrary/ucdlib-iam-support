import {BaseModel} from '@ucd-lib/cork-app-utils';
import AlmaService from '../services/AlmaService.js';
import AlmaStore from '../stores/AlmaStore.js';

class AlmaModel extends BaseModel {

  constructor() {
    super();

    this.store = AlmaStore;
    this.service = AlmaService;
      
    this.register('AlmaModel');
  }

    /**
   * @description Initialize the model by passing through an API key
   * @param {String|Object} config - Either API key or config object.
   */
  init(config={}){
    const defaultConfig = {
      url: 'https://api-na.hosted.exlibrisgroup.com/almaws/v1',
      version: '1.0',
      key: ''
    };
    if ( typeof config === 'string' ){
      config = {key: config};
    }
    this.service.config = {
      ...defaultConfig,
      ...config
    };
  }

  /**
   * @description Returns all roles
   * @returns {Array}
   */
  async getRoles(key){
    let state = this.store.data.roles;
    try {
      if ( state.state === 'loading' ){
        await state.request
      } else {
        await this.service.getRoles(key);
      }
    } catch(e) {}
    const response = this.store.data.roles;
    const result = response.payload;

    return result;
  }


  /**
   * @description Returns all users
   * @returns {Array}
   */
  async getUsers(key){
    let state = this.store.data.users;
    try {
      if ( state.state === 'loading' ){
        await state.request
      } else {
        await this.service.getUsers(key);
      }
    } catch(e) {}

    const response = this.store.data.users;

    const result = response.payload;
    return result;
  }


  /**
   * @description Searches for a user by name
   * @param {String} last - Last Name
   * @param {String} first - First Name
   * @param {String} key - Alma Key
   * @returns Array of users or error object
   */
  async getUsersByName(last, first, key){
      try {
        await this.service.getUsersByName(last, first, key);
      } catch(e) {}
      const qkey = this.service._makeNameQuery(last, first).toString();
      const response = this.store.data.users[qkey];
      const result = response.payload;

      return result;
    }

  /**
   * @description Searches for a user by ID
   * @param {String} id - ID
   * @returns Array of users or error object
   */
  async _getUsersById(id, key){
    try {
      await this.service.getUsersById(id, key);
    } catch(e) {}

    const response = this.store.data.users[id];
    const result = response.payload;

    return result;
  }

}

const model = new AlmaModel();
export default model;