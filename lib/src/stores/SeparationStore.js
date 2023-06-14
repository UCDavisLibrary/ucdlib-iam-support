import {BaseStore} from '@ucd-lib/cork-app-utils';

class SeparationStore extends BaseStore {

  constructor() {
    super();

    this.data = {
      newSubmissions: {},
      byId: {},
      byQuery: {},
      byRecord: {},
    };
    this.events = {
      NEW_SEPARATION_SUBMISSION: 'new-separation-submission',
      SEPARATION_SUBMISSION_FETCH: 'separation-submission-fetch',
      SEPARATION_SUBMISSION_REQUEST: 'separation-submission-request',
      SEPARATION_RECORD: 'separation-record',
      SEPARATION_QUERY: 'separation-query'
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
    this.emit(this.events.NEW_SEPARATION_SUBMISSION, state);
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
    this.emit(this.events.SEPARATION_SUBMISSION_FETCH, state);
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
    this.emit(this.events.SEPARATION_QUERY, state);
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
    this.emit(this.events.SEPARATION_RECORD, state);
  }
}

const store = new SeparationStore();
export default store;
