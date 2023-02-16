import {BaseStore} from '@ucd-lib/cork-app-utils';

class OnboardingStore extends BaseStore {

  constructor() {
    super();

    this.data = {
      newSubmissions: {}
    };
    this.events = {
      NEW_ONBOARDING_SUBMISSION: 'new-onboarding-submission'
    };
  }

  postNewLoading(request, timestamp, submission) {
    this._setNewState({
      state : this.STATE.LOADING,
      request,
      submission
    }, timestamp);
  }

  postNewLoaded(responsePayload, timestamp) {
    this._setNewState({
      state : this.STATE.LOADED,
      responsePayload
    }, timestamp);
  }

  postNewError(error, timestamp, submission) {
    this._setNewState({
      state : this.STATE.ERROR,
      error,
      submission
    }, timestamp);
  }

  _setNewState(state, timestamp) {
    this.data.newSubmissions[timestamp] = state;
    this.emit(this.events.NEW_ONBOARDING_SUBMISSION, state);
  }

}

const store = new OnboardingStore();
export default store;