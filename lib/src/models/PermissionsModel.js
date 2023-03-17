import {BaseModel} from '@ucd-lib/cork-app-utils';
import PermissionsService from '../services/PermissionsService.js';
import PermissionsStore from '../stores/PermissionsStore.js';

class PermissionsModel extends BaseModel {

  constructor() {
    super();

    this.store = PermissionsStore;
    this.service = PermissionsService;
      
    this.register('PermissionsModel');
  }

  async newSubmission(payload){
    const now = (new Date()).toISOString();
    try {
      await this.service.newSubmission(now, payload);
    } catch (error) {
      
    }
    return this.store.data.submissions[now];
  }

}

const model = new PermissionsModel();
export default model;