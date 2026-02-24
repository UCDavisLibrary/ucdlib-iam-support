import {BaseStore, LruStore} from '@ucd-lib/cork-app-utils';

class PersonStore extends BaseStore {

  constructor() {
    super();

    this.data = {
      getById: new LruStore({name: 'person.getById'}),
      getByName: new LruStore({name: 'person.getByName'})
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

    this.events = {};
  }

}

const store = new PersonStore();
export default store;