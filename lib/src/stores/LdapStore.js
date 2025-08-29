import {BaseStore} from '@ucd-lib/cork-app-utils';

class LdapStore extends BaseStore {

  constructor() {
    super();

    this.data = {
      ldap:{}
    };
    this.events = {
      LDAP_FETCHED: 'ldap-fetched'
    };
  }

  getLdapDataLoading(query, request){
    this._setLdapDataState({
      state : this.STATE.LOADING,
      request, query
    })
  }

  getLdapDataLoaded(query, payload){
    this._setLdapDataState({
      state : this.STATE.LOADING,
      payload, query
    })
  }

  getLdapDataError(query, error){
    this._setLdapDataState({
      state : this.STATE.LOADING,
      error, query
    })
  }

  _setLdapDataState(state){
    this.data.ldap = state;
    this.emit(this.events.LDAP_FETCHED, state);
  }

}

const store = new LdapStore();
export default store;