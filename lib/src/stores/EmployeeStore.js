import {BaseStore} from '@ucd-lib/cork-app-utils';

class EmployeeStore extends BaseStore {

  constructor() {
    super();

    this.data = {
      directReports: {},
      byName: {},
    };
    this.events = {
      DIRECT_REPORTS_FETCHED: 'direct-reports-fetched',
      EMPLOYEES_BY_NAME_FETCHED: 'employees-by-name-fetched'
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

}

const store = new EmployeeStore();
export default store;
