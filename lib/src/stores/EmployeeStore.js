import {BaseStore} from '@ucd-lib/cork-app-utils';

class EmployeeStore extends BaseStore {

  constructor() {
    super();

    this.data = {
      directReports: {}
    };
    this.events = {
      DIRECT_REPORTS_FETCHED: 'direct-reports-fetched',
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

}

const store = new EmployeeStore();
export default store;
