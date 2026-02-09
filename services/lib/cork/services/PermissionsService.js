import BaseService from './BaseService.js';
import PermissionsStore from '../stores/PermissionsStore.js';

class PermissionsService extends BaseService {

  constructor() {
    super();
    this.store = PermissionsStore;
  }

  newSubmission(timestamp, payload) {
    return this.request({
      url : '/api/permissions',
      fetchOptions : {
        method : 'POST',
        body : payload
      },
      json: true,
      onLoading : request => this.store.submissionLoading(request, timestamp, payload),
      onLoad : result => this.store.submissionLoaded(result.body, timestamp),
      onError : e => this.store.submissionError(e, timestamp, payload)
    });
  }

  getById(id, idType){
    return this.request({
      url : `/api/permissions/${id}?idType=${idType}`,
      checkCached: () => this.store.data.byId[idType][id],
      onLoading : request => this.store.byIdLoading(request, id, idType),
      onLoad : result => this.store.byIdLoaded(result.body, id, idType),
      onError : e => this.store.byIdError(e, id, idType)
    });
  }

  ownUpdateList(){
    return this.request({
      url : `/api/submitted-permission-requests`,
      checkCached: () => this.store.data.ownUpdateList,
      onLoading : request => this.store.ownUpdateListLoading(request),
      onLoad : result => this.store.ownUpdateListLoaded(result.body),
      onError : e => this.store.ownUpdateListError(e)
    });
  }

}

const service = new PermissionsService();
export default service;
