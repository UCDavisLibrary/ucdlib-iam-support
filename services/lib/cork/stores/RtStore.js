import { BaseStore, LruStore } from '@ucd-lib/cork-app-utils';

class RtStore extends BaseStore {

  constructor() {
    super();

    this.data = {
      ticketHistory: new LruStore({name: 'rt.ticketHistory'})
    };
    this.events = {};
  }


}

const store = new RtStore();
export default store;
