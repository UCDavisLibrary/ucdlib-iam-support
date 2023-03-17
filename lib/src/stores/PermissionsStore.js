import {BaseStore} from '@ucd-lib/cork-app-utils';

class PermissionsStore extends BaseStore {

  constructor() {
    super();

    this.data = {
      submissions: {}
    };
    this.events = {
      PERMISSIONS_SUBMISSION: 'permissions-submission'
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

}

const store = new PermissionsStore();
export default store;