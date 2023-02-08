import {BaseStore} from '@ucd-lib/cork-app-utils';

class GroupStore extends BaseStore {

  constructor() {
    super();

    this.data = {
      groups: {}
    };
    this.events = {
      GROUPS_FETCHED: 'groups-fetched',
    };
  }

  getGroupsLoading(request) {
    this._setGroupsState({
      state : this.STATE.LOADING,
      request
    });
  }

  getGroupsLoaded(payload) {
    this._setGroupsState({
      state : this.STATE.LOADED,
      payload
    });
  }

  getGroupsError(error) {
    this._setGroupsState({
      state : this.STATE.ERROR,
      error
    });
  }

  _setGroupsState(state) {
    this.data.groups = state;
    this.emit(this.events.GROUPS_FETCHED, state);
  }

}

const store = new GroupStore();
export default store;