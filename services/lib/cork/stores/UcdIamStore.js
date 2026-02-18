import {BaseStore, LruStore} from '@ucd-lib/cork-app-utils';

class UcdIamStore extends BaseStore {

  constructor() {
    super();

    this.data = {
      getById: new LruStore({name: 'ucdiam.getById'}),
      getByName: new LruStore({name: 'ucdiam.getByName'})
    };
    this.events = {};
  }

}

const store = new UcdIamStore();
export default store;