import BaseService from './BaseService.js';
import EmployeeStore from '../stores/EmployeeStore.js';

class EmployeeService extends BaseService {

  constructor() {
    super();
    this.store = EmployeeStore;
  }

  getDirectReports(){
    return this.request({
      url : '/api/employees/direct-reports',
      onLoading : request => this.store.getDirectReportsLoading(request),
      checkCached : () => this.store.data.directReports,
      onLoad : result => this.store.getDirectReportsLoaded(result.body),
      onError : e => this.store.getDirectReportsError(e)
    });
  }

}

const service = new EmployeeService();
export default service;
