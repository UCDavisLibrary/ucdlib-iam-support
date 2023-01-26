import {BaseStore} from '@ucd-lib/cork-app-utils';

class ExampleStore extends BaseStore {

  constructor() {
    super();

    this.data = {};
    this.events = {};
  }

}

const store = new ExampleStore();
export default store;