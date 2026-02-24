import {BaseStore, LruStore} from '@ucd-lib/cork-app-utils';

class AlmaUserStore extends BaseStore {

  constructor() {
    super();

    this.data = {
      getUserById: new LruStore({name: 'almaUser.getUserById'}),
      queryUserByName: new LruStore({ name: 'almaUser.queryUserByName' }),
      getRoleTypes: new LruStore({ name: 'almaUser.getRoleTypes' })
    };

    this.events = {};
  }

}

const store = new AlmaUserStore();
export default store;