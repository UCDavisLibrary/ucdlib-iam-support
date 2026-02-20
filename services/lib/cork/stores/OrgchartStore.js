import {BaseStore, LruStore} from '@ucd-lib/cork-app-utils';

class OrgchartStore extends BaseStore {

  constructor() {
    super();

    this.data = {
      create: new LruStore({name: 'orgchart.create'})
    };
    this.events = {};
  }

}

const store = new OrgchartStore();
export default store;