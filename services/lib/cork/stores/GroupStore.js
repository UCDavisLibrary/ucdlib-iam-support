import { BaseStore, LruStore } from '@ucd-lib/cork-app-utils';

class GroupStore extends BaseStore {

  constructor() {
    super();

    this.data = {
      list: new LruStore({ name: 'group.list' }),
      get: new LruStore({ name: 'group.get' }),
      setHead: new LruStore({ name: 'group.setHead' }),
      removeHead: new LruStore({ name: 'group.removeHead' })
    };

    this.events = {};
  }

}

const store = new GroupStore();
export default store;