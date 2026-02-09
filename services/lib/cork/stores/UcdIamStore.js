import {BaseStore} from '@ucd-lib/cork-app-utils';

class UcdIamStore extends BaseStore {

  constructor() {
    super();

    this.data = {
      iamId: {},
      employeeId: {},
      userId: {},
      studentId: {},
      email: {},
      name: {}
    };
    this.events = {};
  }

  getPersonByIdLoading(id, idType, request) {
    this._setPersonByIdState({
      state : this.STATE.LOADING,
      request, id, idType
    });
  }

  getPersonByIdLoaded(id, idType, payload) {
    this._setPersonByIdState({
      state : this.STATE.LOADED,
      payload, id, idType
    });
  }

  getPersonByIdError(id, idType, error) {
    this._setPersonByIdState({
      state : this.STATE.ERROR,
      error, id, idType
    });
  }

  _setPersonByIdState(state) {
    this.data[state.idType][state.id] = state;
  }

  getPersonByNameLoading(query, request) {
    this._setPersonByNameState({
      state : this.STATE.LOADING,
      request, query
    });
  }

  getPersonByNameLoaded(query, payload) {
    this._setPersonByNameState({
      state : this.STATE.LOADED,
      payload, query
    });
  }

  getPersonByNameError(query, error) {
    this._setPersonByNameState({
      state : this.STATE.ERROR,
      error, query
    });
  }

  _setPersonByNameState(state) {
    this.data.name[state.query.toString()] = state;
  }

}

const store = new UcdIamStore();
export default store;