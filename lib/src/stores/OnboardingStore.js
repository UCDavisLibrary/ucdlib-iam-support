import {BaseStore} from '@ucd-lib/cork-app-utils';

class OnboardingStore extends BaseStore {

  constructor() {
    super();

    this.data = {
      newSubmissions: {},
      byId: {},
      byQuery: {},
      byRecord: {},
      reconciliation: {},
      backgroundCheck: {}
    };
    this.events = {
      NEW_ONBOARDING_SUBMISSION: 'new-onboarding-submission',
      ONBOARDING_RECONCILIATION: 'onboarding-reconciliation',
      ONBOARDING_BACKGROUND_CHECK: 'onboarding-background-check',
      ONBOARDING_SUBMISSION_FETCH: 'onboarding-submission-fetch',
      ONBOARDING_SUBMISSION_REQUEST: 'onboarding-submission-request',
      ONBOARDING_RECORD: 'onboarding-record',
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

  reconciliationLoading(request, id) {
    this._setReconciliationState({
      state : this.STATE.LOADING,
      request
    }, id);
  }

  reconciliationLoaded(payload, id) {
    this._setReconciliationState({
      state : this.STATE.LOADED,
      payload
    }, id);
  }

  reconciliationError(error, id) {
    this._setReconciliationState({
      state : this.STATE.ERROR,
      error
    }, id);
  }

  _setReconciliationState(state, id) {
    this.data.reconciliation[id] = state;
    this.emit(this.events.ONBOARDING_RECONCILIATION, state);
  }

  backgroundCheckLoading(request, id) {
    this._setBackgroundCheckState({
      state : this.STATE.LOADING,
      request
    }, id);
  }

  backgroundCheckLoaded(payload, id) {
    this._setBackgroundCheckState({
      state : this.STATE.LOADED,
      payload
    }, id);
  }

  backgroundCheckError(error, id) {
    this._setBackgroundCheckState({
      state : this.STATE.ERROR,
      error
    }, id);
  }

  _setBackgroundCheckState(state, id) {
    this.data.backgroundCheck[id] = state;
    this.emit(this.events.ONBOARDING_BACKGROUND_CHECK, state);
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

  byRecordLoading(request, query) {
    this._setByRecordstate({
      state : this.STATE.LOADING,
      request
    }, query);
  }

  byRecordLoaded(payload, query) {
    this._setByRecordstate({
      state : this.STATE.LOADED,
      payload
    }, query);
  }

  byRecordError(error, query) {
    this._setByRecordstate({
      state : this.STATE.ERROR,
      error
    }, query);
  }

  _setByRecordstate(state) {
    this.data.byRecord["result"] = state;
    this.emit(this.events.ONBOARDING_RECORD, state);
  }
}

const store = new OnboardingStore();
export default store;
