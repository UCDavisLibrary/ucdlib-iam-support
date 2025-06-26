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

  searchById(id, idType){
    const params = new URLSearchParams();
    params.set('idType', idType);
    return this.request({
      url : `/api/employees/${id}?` +  params.toString(),
      onLoading : request => this.store.byIdLoading(request, id),
      checkCached : () => this.store.data.byId,
      onLoad : result => this.store.byIdLoaded(result.body, id),
      onError : e => this.store.byIdError(e, id)
    });
  }


  update(id, payload){
    return this.request({
      url : `/api/employees/${id}`,
      fetchOptions : {
        method : 'POST',
        body : payload
      },
      json: true,
      onLoading : request => this.store.updateEmployeeLoading(request, id),
      checkCached : () => this.store.data.update,
      onLoad : result => this.store.updateEmployeeLoaded(result.body, id),
      onError : e => this.store.updateEmployeeError(e, id)
    });
  }

  addToGroup(id, payload){
    return this.request({
      url : `/api/employees/addgroup/${id}`,
      fetchOptions : {
        method : 'POST',
        body : payload
      },
      json: true,
      onLoading : request => this.store.addToGroupLoading(request, id),
      checkCached : () => this.store.data.addEmployeeToGroup,
      onLoad : result => this.store.addToGroupLoaded(result.body, id),
      onError : e => this.store.addToGroupError(e, id)
    });
  }

  removeFromGroup(id, payload){
    return this.request({
      url : `/api/employees/removegroup/${id}`,
      fetchOptions : {
        method : 'POST',
        body : payload
      },
      json: true,
      onLoading : request => this.store.removeFromGroupLoading(request, id),
      checkCached : () => this.store.data.removeEmployeeFromGroup,
      onLoad : result => this.store.removeFromGroupLoaded(result.body, id),
      onError : e => this.store.removeFromGroupError(e, id)
    });
  }

}

const service = new EmployeeService();
export default service;
