import {BaseStore} from '@ucd-lib/cork-app-utils';

class UcdIamStore extends BaseStore {

  constructor() {
    super();

    this.data = {
      iamId: {},
      employeeId: {},
      userId: {},
      studentId: {},
      email: {}
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

}

const store = new UcdIamStore();
export default store;