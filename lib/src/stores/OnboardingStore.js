import {BaseStore} from '@ucd-lib/cork-app-utils';

class OnboardingStore extends BaseStore {

  constructor() {
    super();

    this.data = {
      newSubmissions: {},
      byId: {},
      byQuery: {}
    };
    this.events = {
      NEW_ONBOARDING_SUBMISSION: 'new-onboarding-submission',
      ONBOARDING_SUBMISSION_FETCH: 'onboarding-submission-fetch',
      ONBOARDING_QUERY: 'onboarding-query'
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

  byIdLoading(request, id) {
    this._setByIdState({
      state : this.STATE.LOADING,
      request
    }, id);
  }

  byIdLoaded(payload, id) {
    this._setByIdState({
      state : this.STATE.LOADED,
      payload
    }, id);
  }

  byIdError(error, id) {
    this._setByIdState({
      state : this.STATE.ERROR,
      error
    }, id);
  }

  _setByIdState(state, id) {
    this.data.byId[id] = state;
    this.emit(this.events.ONBOARDING_SUBMISSION_FETCH, state);
  }

  byQueryLoading(request, id) {
    this._setByQuerystate({
      state : this.STATE.LOADING,
      request
    }, id);
  }

  byQueryLoaded(payload, id) {
    this._setByQuerystate({
      state : this.STATE.LOADED,
      payload
    }, id);
  }

  byQueryError(error, id) {
    this._setByQuerystate({
      state : this.STATE.ERROR,
      error
    }, id);
  }

  _setByQuerystate(state, id) {
    this.data.byQuery[id] = state;
    state.queryId = id;
    this.emit(this.events.ONBOARDING_QUERY, state);
  }

}

const store = new OnboardingStore();
export default store;