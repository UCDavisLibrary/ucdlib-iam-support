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

  searchByName(name){
    const params = new URLSearchParams();
    params.set('name', name);
    return this.request({
      url : '/api/employees/search?' + params.toString(),
      onLoading : request => this.store.byNameLoading(request, name),
      checkCached : () => this.store.data.byName[name],
      onLoad : result => this.store.byNameLoaded(result.body, name),
      onError : e => this.store.byNameError(e, name)
    });
  }

}

const service = new EmployeeService();
export default service;
