import {BaseStore, LruStore} from '@ucd-lib/cork-app-utils';

class EmployeeStore extends BaseStore {

  constructor() {
    super();

    this.data = {
      directReports: new LruStore({name: 'employee.directReports'}),
      query: new LruStore({ name: 'employee.query' }),
      get: new LruStore({ name: 'employee.get' }),
      update: new LruStore({ name: 'employee.update' }),
      addToGroup: new LruStore({ name: 'employee.addToGroup' }),
      removeFromGroup: new LruStore({ name: 'employee.removeFromGroup' }),
      activeDiscrepancies: new LruStore({name: 'employee.activeDiscrepancies'}),
      dismissDiscrepancies: new LruStore({name: 'employee.dismissDiscrepancies'})
    };
    this.events = {};
  }

}

const store = new EmployeeStore();
export default store;
