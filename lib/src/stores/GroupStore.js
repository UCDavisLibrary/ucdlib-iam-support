import {BaseStore} from '@ucd-lib/cork-app-utils';

class GroupStore extends BaseStore {

  constructor() {
    super();

    this.data = {
      groups: {},
      groupById: {},
      update: {},
      setGroupHead: {},
      removeGroupHead: {}
    };
    this.events = {
      GROUPS_FETCHED: 'groups-fetched',
      GROUP_ID_FETCHED: 'group-id-fetched',
      SET_GROUPS_HEAD: 'set-groups-head',
      REMOVE_GROUPS_HEAD: 'remove-groups-head'
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

  getByIdLoading(id, request) {
    this._setGetByIdState({
      state : this.STATE.LOADING,
      request, id
    });
  }

  getByIdLoaded(id, payload) {
    this._setGetByIdState({
      state : this.STATE.LOADED,
      payload, id
    });
  }

  getByIdError(id, error) {
    this._setGetByIdState({
      state : this.STATE.ERROR,
      error, id
    });
  }

  _setGetByIdState(state) {
    this.data.groupById = state;
    this.emit(this.events.GROUP_ID_FETCHED, state);
  }

  setGroupHeadLoading(request, id) {
    this._setGroupHeadState({
      state : this.STATE.LOADING,
      request
    }, id);
  }

  setGroupHeadLoaded(payload, id) {
    this._setGroupHeadState({
      state : this.STATE.LOADED,
      payload
    }, id);
  }

  setGroupHeadError(error, id) {
    this._setGroupHeadState({
      state : this.STATE.ERROR,
      error
    }, id);
  }

  _setGroupHeadState(state) {
    this.data.setGroupHead = state;
    this.emit(this.events.SET_GROUPS_HEAD, state);
  }


  removeGroupHeadLoading(request, id) {
    this._removeGroupHeadState({
      state : this.STATE.LOADING,
      request
    }, id);
  }

  removeGroupHeadLoaded(payload, id) {
    this._removeGroupHeadState({
      state : this.STATE.LOADED,
      payload
    }, id);
  }

  removeGroupHeadError(error, id) {
    this._removeGroupHeadState({
      state : this.STATE.ERROR,
      error
    }, id);
  }

  _removeGroupHeadState(state) {
    this.data.removeGroupHead = state;
    this.emit(this.events.REMOVE_GROUPS_HEAD, state);
  }

}

const store = new GroupStore();
export default store;