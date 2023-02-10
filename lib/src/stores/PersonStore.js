import {BaseStore} from '@ucd-lib/cork-app-utils';

class PersonStore extends BaseStore {

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

    this.idEndpoint = '/api/ucd-iam/person';
    this.nameEndpoint = '/api/ucd-iam/person/search';

    this.searchParams = {
      studentId: {
        hasDetailedData: false,
        endpoint: this.idEndpoint
      },
      employeeId: {
        hasDetailedData: false,
        endpoint: this.idEndpoint
      },
      iamId: {
        hasDetailedData: true,
        endpoint: this.idEndpoint
      },
      userId: {
        hasDetailedData: true,
        endpoint: this.idEndpoint
      },
      email: {
        hasDetailedData: true,
        endpoint: this.idEndpoint
      },
      name: {
        hasDetailedData: false,
        endpoint: this.nameEndpoint
      }
    };

    this.events = {
      SEARCH_UPDATE: 'search-update',
      SELECT_UPDATE: 'select-update'
    };
  }

  getPersonByIdLoading(id, idType, request, event) {
    this._setPersonByIdState({
      state : this.STATE.LOADING,
      request, id, idType, event
    });
  }

  getPersonByIdLoaded(id, idType, payload, event) {
    this._setPersonByIdState({
      state : this.STATE.LOADED,
      payload, id, idType, event
    });
  }

  getPersonByIdError(id, idType, error, event) {
    this._setPersonByIdState({
      state : this.STATE.ERROR,
      error, id, idType, event
    });
  }

  _setPersonByIdState(state) {
    this.data[state.idType][state.id] = state;
    
    if ( state.event === 'search') {
      this.emit(this.events.SEARCH_UPDATE, state);
    } else {
      this.emit(this.events.SELECT_UPDATE, state);
    }
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
    this.emit(this.events.SEARCH_UPDATE, state);
  }


}

const store = new PersonStore();
export default store;