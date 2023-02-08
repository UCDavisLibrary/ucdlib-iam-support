import {BaseStore} from '@ucd-lib/cork-app-utils';

class GroupStore extends BaseStore {

  constructor() {
    super();

    this.data = {};
    this.events = {};
  }

}

const store = new GroupStore();
export default store;