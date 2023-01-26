import {BaseStore} from '@ucd-lib/cork-app-utils';

class UcdIamStore extends BaseStore {

  constructor() {
    super();

    this.data = {};
    this.events = {};
  }

}

const store = new UcdIamStore();
export default store;