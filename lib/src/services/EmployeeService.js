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

  getMetadata(id){

    return this.request({
      url : `/api/employees/metadata/${id}`,
      onLoading : request => this.store.byMetadataLoading(request, id),
      checkCached : () => this.store.data.byMetadata[id],
      onLoad : result => this.store.byMetadataLoaded(result.body, id),
      onError : e => this.store.byMetadataError(e, id)
    });
  }


  updateMetadata(payload, id){
    return this.request({
      url : `/api/employees/metadata/${id}`,
      fetchOptions : {
        method : 'POST',
        body : payload
      },
      json: true,
      onLoading : request => this.store.updateMetadataLoading(request, id, payload),
      checkCached: () => this.store.data.updateMetadata[id],
      onLoad : result => this.store.updateMetadataLoaded(result.body, id),
      onError : e => this.store.updateMetadataError(e, id, payload)
    });
  }


}

const service = new EmployeeService();
export default service;
