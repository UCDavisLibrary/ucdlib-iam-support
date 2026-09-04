import {BaseStore, LruStore} from '@ucd-lib/cork-app-utils';

class RosettaStore extends BaseStore {

  constructor() {
    super();

    this.data = {
      getPerson: new LruStore({name: 'rosetta.getPerson'}),
      searchPeople: new LruStore({name: 'rosetta.searchPeople'})
    };
    this.events = {};
  }

}

const store = new RosettaStore();
export default store;