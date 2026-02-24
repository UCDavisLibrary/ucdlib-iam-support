import {BaseStore, LruStore} from '@ucd-lib/cork-app-utils';

class PermissionsStore extends BaseStore {

  constructor() {
    super();

    this.data = {
      create: new LruStore({name: 'permissions.create'}),
      get: new LruStore({name: 'permissions.get'}),
      query: new LruStore({name: 'permissions.query'})
    };

    this.events = {};
  }

}

const store = new PermissionsStore();
export default store;
