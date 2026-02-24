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
   * @description Returns all roles
   */
  getRoles(){
    return this.service.getRoles();
  }

  /**
   * @description Searches for a user by name
   * @param {String} lastName - Last Name
   * @param {String} firstName - First Name
   */
  async queryUserByName(lastName, firstName){
    return this.service.queryUserByName(lastName, firstName);
  }

  async getUserById(id){
    return this.service.getUserById(id);
  }

}

const model = new AlmaModel();
export default model;