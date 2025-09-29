import BaseService from './BaseService.js';
import LdapStore from '../stores/LdapStore.js';

class LdapService extends BaseService {

  constructor() {
    super();
    this.store = LdapStore;
  }

  getLdapData(query){
    const params = new URLSearchParams(query).toString();

    return this.request({
      url: `/api/ldap?${params}`,
      checkCached: () => this.store.data.ldap,
      onLoading : request => this.store.getLdapDataLoading(query, request),
      onLoad : result => this.store.getLdapDataLoaded(query, result.body),
      onError : e => this.store.getLdapDataError(query, e)
    });
  }
  

}

const service = new LdapService();
export default service;