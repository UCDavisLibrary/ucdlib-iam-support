import { BaseStore, LruStore } from '@ucd-lib/cork-app-utils';

class LdapStore extends BaseStore {

  constructor() {
    super();

    this.data = {
      query: new LruStore({ name: 'ldap.query' })
    };
    this.events = {};
  }

}

const store = new LdapStore();
export default store;