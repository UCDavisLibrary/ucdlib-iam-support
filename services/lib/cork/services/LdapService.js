import BaseService from './BaseService.js';
import LdapStore from '../stores/LdapStore.js';

import { digest } from '@ucd-lib/cork-app-utils';

class LdapService extends BaseService {

  constructor() {
    super();
    this.store = LdapStore;
  }

  get baseUrl(){
    return `/api/ldap`;
  }

  async query(query){
    let id = await digest(query);
    const store = this.store.data.query;

    await this.checkRequesting(
      id, store,
      () => this.request({
        url : `${this.baseUrl}`,
        qs: query,
        checkCached : () => store.get(id),
        onUpdate : resp => this.store.set(
          {...resp, id},
          store
        )
      })
    );

    return store.get(id);
  }

}

const service = new LdapService();
export default service;