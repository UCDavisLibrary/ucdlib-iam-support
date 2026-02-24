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

  getRoleTypes(){
    return this.service.getRoleTypes();
  }

  getUserById(id){
    return this.service.getUserById(id);
  }

  queryUserByName(last, first){
    return this.service.queryUserByName(last, first);
  }


}

const model = new AlmaUserModel();
export default model;