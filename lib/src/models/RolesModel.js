import {BaseModel} from '@ucd-lib/cork-app-utils';
import RolesService from '../services/RolesService.js';
import RolesStore from '../stores/RolesStore.js';

class RolesModel extends BaseModel {

  constructor() {
    super();

    this.store = RolesStore;
    this.service = RolesService;
      
    this.register('RolesModel');
  }

    /**
   * @description Initialize the model by passing through an API key
   * @param {String|Object} config - Either API key or config object.
   */
  init(config={}){
    const defaultConfig = {
      url: 'https://api-na.hosted.exlibrisgroup.com/almaws/v1/',
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
   * @description Returns all active groups
   * @returns {Array}
   */
  async getAll(){
    let state = this.store.data.roles;
    try {
      if ( state.state === 'loading' ){
        await state.request
      } else {
        await this.service.getRoles();
      }
    } catch(e) {}
    return this.store.data.roles;
  }

}

const model = new RolesModel();
export default model;