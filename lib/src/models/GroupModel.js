import {BaseModel} from '@ucd-lib/cork-app-utils';
import GroupService from '../services/GroupService.js';
import GroupStore from '../stores/GroupStore.js';

class GroupModel extends BaseModel {

  constructor() {
    super();

    this.store = GroupStore;
    this.service = GroupService;
      
    this.register('GroupModel');
  }

}

const model = new GroupModel();
export default model;