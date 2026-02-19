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

  async get(id, idType) {
    const storeKey = `${idType}:${id}`;
    const store = this.store.data.get;

    await this.checkRequesting(
      storeKey, store,
      () => this.request({
        url : `/api/permissions/${id}`,
        qs: {idType},
        checkCached : () => store.get(storeKey),
        onUpdate : resp => this.store.set(
          {...resp, id: storeKey},
          store
        )
      })
    );
    return store.get(storeKey);
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
