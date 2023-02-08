import {BaseService} from '@ucd-lib/cork-app-utils';
import GroupStore from '../stores/GroupStore.js';

class GroupService extends BaseService {

  constructor() {
    super();
    this.store = GroupStore;
  }

}

const service = new GroupService();
export default service;