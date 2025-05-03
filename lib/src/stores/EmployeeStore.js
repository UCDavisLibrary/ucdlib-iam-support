import {BaseStore} from '@ucd-lib/cork-app-utils';

class EmployeeStore extends BaseStore {

  constructor() {
    super();

    this.data = {
      directReports: {},
      byName: {},
      byMetadata: {},
      updateMetadata: {}
    };
    this.events = {
      DIRECT_REPORTS_FETCHED: 'direct-reports-fetched',
      EMPLOYEES_BY_NAME_FETCHED: 'employees-by-name-fetched',
      METADATA_FETCHED: 'metadata-fetched',
      METADATA_UPDATED: 'metadata-updated'
    };
  }
  getDirectReportsLoading(request) {
    this._setDirectReportsState({
      state : this.STATE.LOADING,
      request
    });
  }

  getDirectReportsLoaded(payload) {
    this._setDirectReportsState({
      state : this.STATE.LOADED,
      payload
    });
  }

  getDirectReportsError(error) {
    this._setDirectReportsState({
      state : this.STATE.ERROR,
      error
    });
  }

  _setDirectReportsState(state) {
    this.data.directReports = state;
    this.emit(this.events.DIRECT_REPORTS_FETCHED, state);
  }

  byNameLoading(request, name) {
    this._setByNameState({
      state : this.STATE.LOADING,
      request
    }, name);
  }

  byNameLoaded(payload, name) {
    this._setByNameState({
      state : this.STATE.LOADED,
      payload
    }, name);
  }

  byNameError(error, name) {
    this._setByNameState({
      state : this.STATE.ERROR,
      error
    }, name);
  }

  _setByNameState(state, name) {
    this.data.byName[name] = state;
    this.emit(this.events.EMPLOYEES_BY_NAME_FETCHED, state);
  }

  byMetadataLoading(request, id, idType) {
    this._setByMetadataState({
      state : this.STATE.LOADING,
      request
    }, id, idType);
  }

  byMetadataLoaded(payload, id, idType) {
    this._setByMetadataState({
      state : this.STATE.LOADED,
      payload
    }, id, idType);
  }

  byMetadataError(error, id, idType) {
    this._setByMetadataState({
      state : this.STATE.ERROR,
      error
    }, id, idType);
  }

  _setByMetadataState(state, id) {
    this.data.byMetadata[id] = state;
    this.emit(this.events.METADATA_FETCHED, state);
  }

  updateMetadataLoading(request, id) {
    this._setUpdatedMetadataState({
      state : this.STATE.LOADING,
      request
    }, id);
  }

  updateMetadataLoaded(payload, id) {
    this._setUpdatedMetadataState({
      state : this.STATE.LOADED,
      payload
    }, id);
  }

  updateMetadataError(error, id) {
    this._setUpdatedMetadataState({
      state : this.STATE.ERROR,
      error
    }, id);
  }

  _setUpdatedMetadataState(state, id) {
    this.data.updateMetadata[id] = state;
    this.emit(this.events.METADATA_UPDATED, state);
  }


}

const store = new EmployeeStore();
export default store;
