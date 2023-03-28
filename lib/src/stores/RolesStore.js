import {BaseStore} from '@ucd-lib/cork-app-utils';

class RolesStore extends BaseStore {

  constructor() {
    super();

    this.data = {
      roles: {}
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
    this.emit(this.events.ROLES_FETCHED, state);
  }

}

const store = new RolesStore();
export default store;