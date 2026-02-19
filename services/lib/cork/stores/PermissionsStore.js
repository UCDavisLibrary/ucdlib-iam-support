import {BaseStore, LruStore} from '@ucd-lib/cork-app-utils';

class PermissionsStore extends BaseStore {

  constructor() {
    super();

    this.data = {
      submissions: {},
      get: new LruStore({name: 'permissions.get'}),
      ownUpdateList: {}
    };
    this.events = {
      PERMISSIONS_SUBMISSION: 'permissions-submission',
      PERMISSIONS_OWN_UPDATE_LIST_FETCH: 'permissions-own-update-list-fetch',
    };
  }

  submissionLoading(request, timestamp, submission) {
    this._setSubmissionState({
      state : this.STATE.LOADING,
      request,
      submission
    }, timestamp);
  }

  submissionLoaded(responsePayload, timestamp) {
    this._setSubmissionState({
      state : this.STATE.LOADED,
      responsePayload
    }, timestamp);
  }

  submissionError(error, timestamp, submission) {
    this._setSubmissionState({
      state : this.STATE.ERROR,
      error,
      submission
    }, timestamp);
  }

  _setSubmissionState(state, timestamp) {
    this.data.submissions[timestamp] = state;
    this.emit(this.events.PERMISSIONS_SUBMISSION, state);
  }

  ownUpdateListLoading(request) {
    this._setOwnUpdateList({
      state : this.STATE.LOADING,
      request
    });
  }

  ownUpdateListLoaded(payload) {
    this._setOwnUpdateList({
      state : this.STATE.LOADED,
      payload
    });
  }

  ownUpdateListError(error) {
    this._setOwnUpdateList({
      state : this.STATE.ERROR,
      error
    });
  }

  _setOwnUpdateList(state) {
    this.data.ownUpdateList = state;
    this.emit(this.events.PERMISSIONS_OWN_UPDATE_LIST_FETCH, state);
  }

}

const store = new PermissionsStore();
export default store;
