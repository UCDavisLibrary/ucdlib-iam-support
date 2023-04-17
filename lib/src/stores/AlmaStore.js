import {BaseStore} from '@ucd-lib/cork-app-utils';

class AlmaStore extends BaseStore {

  constructor() {
    super();

    this.data = {
      roles: {},
      users: {}
    };
    this.events = {
      ROLES_FETCHED: 'roles-fetched',
    };
  }

  getRolesLoading(request) {
    this._setRolesState({
      state : this.STATE.LOADING,
      request
    });
  }

  getRolesLoaded(payload) {
    this._setRolesState({
      state : this.STATE.LOADED,
      payload
    });
  }

  getRolesError(error) {
    this._setRolesState({
      state : this.STATE.ERROR,
      error
    });
  }

  _setRolesState(state) {
    this.data.roles = state;
  }


  getUsersLoading(request) {
    this._setUsersState({
      state : this.STATE.LOADING,
      request
    });
  }

  getUsersLoaded(payload) {
    this._setUsersState({
      state : this.STATE.LOADED,
      payload
    });
  }

  getUsersError(error) {
    this._setUsersState({
      state : this.STATE.ERROR,
      error
    });
  }

  _setUsersState(state) {
    this.data.users = state;
  }

  getUsersByIdLoading(id, request) {
    this._setUsersByIdState({
      state : this.STATE.LOADING,
      request, id
    });
  }

  getUsersByIdLoaded(id, payload) {
    this._setUsersByIdState({
      state : this.STATE.LOADED,
      payload, id
    });
  }

  getUsersByIdError(id, error) {
    this._setUsersByIdState({
      state : this.STATE.ERROR,
      error, id
    });
  }

  _setUsersByIdState(state) {
    this.data.users[state.id] = state;
  }


  getUsersByNameLoading(query, request) {
    this._setUsersByNameState({
      state : this.STATE.LOADING,
      request, query
    });
  }

  getUsersByNameLoaded(query, payload) {
    this._setUsersByNameState({
      state : this.STATE.LOADED,
      payload, query
    });
  }

  getUsersByNameError(query, error) {
    this._setUsersByNameState({
      state : this.STATE.ERROR,
      error, query
    });
  }

  _setUsersByNameState(state) {
    this.data.users[state.query.toString()] = state;
  }

}

const store = new AlmaStore();
export default store;