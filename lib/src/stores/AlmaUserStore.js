import {BaseStore} from '@ucd-lib/cork-app-utils';

class AlmaUserStore extends BaseStore {

  constructor() {
    super();

    this.data = {
      almaId: {},
      name: {},
      roleType: {},
      bulk: {}
    };

    this.idEndpoint = '/users';
    this.roleEndpoint = '/roleTypes';
    this.nameEndpoint = '/users/search';
    this.bulkEndpoint = '/users/bulksearch';

    this.searchParams = {
      almaId: {
        hasDetailedData: false,
        endpoint: this.idEndpoint
      },
      roleType: {
        hasDetailedData: false,
        endpoint: this.roleEndpoint
      },
      name: {
        hasDetailedData: false,
        endpoint: this.nameEndpoint
      },
      bulk: {
        hasDetailedData: false,
        endpoint: this.bulkEndpoint
      }
    };

    this.events = {
      SEARCH_UPDATE: 'search-update',
      SELECT_UPDATE: 'select-update',
      ROLETYPE_UPDATE: 'roletype-update'
    };
  }

  getAlmaUserByIdLoading(id, idType, request, event) {
    this._setAlmaUserByIdState({
      state : this.STATE.LOADING,
      request, id, idType, event
    });
  }

  getAlmaUserByIdLoaded(id, idType, payload, event) {
    this._setAlmaUserByIdState({
      state : this.STATE.LOADED,
      payload, id, idType, event
    });
  }

  getAlmaUserByIdError(id, idType, error, event) {
    this._setAlmaUserByIdState({
      state : this.STATE.ERROR,
      error, id, idType, event
    });
  }

  _setAlmaUserByIdState(state) {
    this.data[state.idType][state.id] = state;
    
    if ( !state.event ) {
      // do nothing
    } else if ( state.event === 'search') {
      this.emit(this.events.SEARCH_UPDATE, state);
    } else {
      this.emit(this.events.SELECT_UPDATE, state);
    }
  }

  getAlmaUserByNameLoading(query, request) {
    this._setAlmaUserByNameState({
      state : this.STATE.LOADING,
      request, query
    });
  }

  getAlmaUserByNameLoaded(query, payload) {
    this._setAlmaUserByNameState({
      state : this.STATE.LOADED,
      payload, query
    });
  }

  getAlmaUserByNameError(query, error) {
    this._setAlmaUserByNameState({
      state : this.STATE.ERROR,
      error, query
    });
  }

  _setAlmaUserByNameState(state) {
    this.data.name[state.query.toString()] = state;
    this.emit(this.events.SEARCH_UPDATE, state);
  }

  getAlmaUserRoleTypeLoading(request) {
    this._setAlmaUserRoleTypeState({
      state : this.STATE.LOADING,
      request
    });
  }

  getAlmaUserRoleTypeLoaded(payload) {
    this._setAlmaUserRoleTypeState({
      state : this.STATE.LOADED,
      payload
    });
  }

  getAlmaUserRoleTypeError(error) {
    this._setAlmaUserRoleTypeState({
      state : this.STATE.ERROR,
      error
    });
  }

  _setAlmaUserRoleTypeState(state) {
    this.data.roleType = state;
    this.emit(this.events.ROLETYPE_UPDATE, state);
  }




  getAlmaUserByIdsLoading(id, request, event) {
    this._setPeopleByIdsState({
      state : this.STATE.LOADING,
      request, id, event
    });
  }

  getAlmaUserByIdsLoaded(id, payload, event) {
    this._setPeopleByIdsState({
      state : this.STATE.LOADED,
      payload, id, event
    });
  }

  getAlmaUserByIdsError(id, error, event) {
    this._setPeopleByIdsState({
      state : this.STATE.ERROR,
      error, id, event
    });
  }

  _setAlmaUserByIdsState(state) {
    this.data.bulk = state;
    
    if ( !state.event ) {
      // do nothing
    } else if ( state.event === 'search') {
      this.emit(this.events.SEARCH_UPDATE, state);
    } else {
      this.emit(this.events.SELECT_UPDATE, state);
    }
  }



}

const store = new AlmaUserStore();
export default store;