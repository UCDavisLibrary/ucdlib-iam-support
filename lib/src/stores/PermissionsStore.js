import {BaseStore} from '@ucd-lib/cork-app-utils';

class PermissionsStore extends BaseStore {

  constructor() {
    super();

    this.data = {
      submissions: {},
      byId: {
        onboarding: {},
        update: {}
      }
    };
    this.events = {
      PERMISSIONS_SUBMISSION: 'permissions-submission',
      PERMISSIONS_RECORD_FETCH: 'permissions-record-fetch',
      PERMISSIONS_RECORD_REQUEST: 'permissions-record-request'
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

  byIdLoading(request, id, idType) {
    this._setByIdState({
      state : this.STATE.LOADING,
      request
    }, id, idType);
  }

  byIdLoaded(payload, id, idType) {
    this._setByIdState({
      state : this.STATE.LOADED,
      payload
    }, id, idType);
  }

  byIdError(error, id, idType) {
    this._setByIdState({
      state : this.STATE.ERROR,
      error
    }, id, idType);
  }

  _setByIdState(state, id, idType) {
    this.data.byId[idType][id] = state;
    this.emit(this.events.PERMISSIONS_RECORD_FETCH, state);
  }

}

const store = new PermissionsStore();
export default store;
