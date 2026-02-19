import {BaseStore, LruStore} from '@ucd-lib/cork-app-utils';

class SeparationStore extends BaseStore {

  constructor() {
    super();

    this.data = {
      query: new LruStore({name: 'separation.query'}),
      create: new LruStore({name: 'separation.create'}),
      get: new LruStore({name: 'separation.get'}),
      byName: new LruStore({name: 'separation.byName'}),
      deprovision: new LruStore({name: 'separation.deprovision'})
    };
    this.events = {};
  }
}

const store = new SeparationStore();
export default store;
