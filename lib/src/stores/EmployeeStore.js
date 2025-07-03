import {BaseStore} from '@ucd-lib/cork-app-utils';

class EmployeeStore extends BaseStore {

  constructor() {
    super();

    this.data = {
      directReports: {},
      byName: {},
      byId: {},
      update: {},
      addEmployeeToGroup: {},
      removeEmployeeFromGroup: {}
    };
    this.events = {
      DIRECT_REPORTS_FETCHED: 'direct-reports-fetched',
      EMPLOYEES_BY_NAME_FETCHED: 'employees-by-name-fetched',
      EMPLOYEES_BY_ID_FETCHED: 'employees-by-id-fetched',
      UPDATE_EMPLOYEES: 'update-employees',
      ADD_EMPLOYEE_TO_GROUP: 'add-employee-to-group',
      REMOVE_EMPLOYEE_FROM_GROUP: 'remove-employee-from-group'
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
    this.data.byId = state;
    this.emit(this.events.EMPLOYEES_BY_ID_FETCHED, state);
  }


  updateEmployeeLoading(request, id) {
    this._setEmployeeUpdate({
      state : this.STATE.LOADING,
      request
    }, id);
  }

  updateEmployeeLoaded(payload, id) {
    this._setEmployeeUpdate({
      state : this.STATE.LOADED,
      payload
    }, id);
  }

  updateEmployeeError(error, id) {
    this._setEmployeeUpdate({
      state : this.STATE.ERROR,
      error
    }, id);
  }

  _setEmployeeUpdate(state) {
    this.data.update = state;
    this.emit(this.events.UPDATE_EMPLOYEES, state);
  }





  addToGroupLoading(request, id) {
    this._setEmployeeToGroup({
      state : this.STATE.LOADING,
      request
    }, id);
  }

  addToGroupLoaded(payload, id) {
    this._setEmployeeToGroup({
      state : this.STATE.LOADED,
      payload
    }, id);
  }

  addToGroupError(error, id) {
    this._setEmployeeToGroup({
      state : this.STATE.ERROR,
      error
    }, id);
  }

  _setEmployeeToGroup(state) {
    this.data.addEmployeeToGroup = state;
    this.emit(this.events.ADD_EMPLOYEE_TO_GROUP, state);
  }




  removeFromGroupLoading(request, id) {
    this._unsetEmployeeFromGroup({
      state : this.STATE.LOADING,
      request
    }, id);
  }

  removeFromGroupLoaded(payload, id) {
    this._unsetEmployeeFromGroup({
      state : this.STATE.LOADED,
      payload
    }, id);
  }

  removeFromGroupError(error, id) {
    this._unsetEmployeeFromGroup({
      state : this.STATE.ERROR,
      error
    }, id);
  }

  _unsetEmployeeFromGroup(state) {
    this.data.removeEmployeeFromGroup = state;
    this.emit(this.events.REMOVE_EMPLOYEE_FROM_GROUP, state);
  }

}

const store = new EmployeeStore();
export default store;
