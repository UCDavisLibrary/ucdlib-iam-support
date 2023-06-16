import BaseService from './BaseService.js';
import SeparationStore from '../stores/SeparationStore.js';

class SeparationService extends BaseService {

  constructor() {
    super();
    this.store = SeparationStore;
  }

  newSubmission(timestamp, payload) {
    return this.request({
      url : '/api/separation/new',
      fetchOptions : {
        method : 'POST',
        body : payload
      },
      json: true,
      onLoading : request => this.store.postNewLoading(request, timestamp, payload),
      onLoad : result => this.store.postNewLoaded(result.body, timestamp),
      onError : e => this.store.postNewError(e, timestamp, payload)
    });
  }

  getById(id){
    return this.request({
      url : `/api/separation/${id}`,
      checkCached: () => this.store.data.byId[id],
      onLoading : request => this.store.byIdLoading(request, id),
      onLoad : result => this.store.byIdLoaded(result.body, id),
      onError : e => this.store.byIdError(e, id)
    });
  }

  changeById(id, q){
    return this.request({
      url : `/api/separation/${id}?q=${q}`,
      checkCached: () => this.store.data.byChangeId[id],
      onLoading : request => this.store.byChangeIdLoading(request, id),
      onLoad : result => this.store.byChangeIdLoaded(result.body, id),
      onError : e => this.store.byChangeIdError(e, id)
    });
  }

  recordSearch(q){
    return this.request({
      url : `/api/separation/search?${q}`,
      // checkCached: () => this.store.data.byRecord[q],
      onLoading : request => this.store.byRecordLoading(request, q),
      onLoad : result => this.store.byRecordLoaded(result.body, q),
      onError : e => this.store.byRecordError(e, q)
    });
  }

  query(id){
    return this.request({
      url : `/api/separation${id != 'all' ? '?' + id: ''}`,
      checkCached: () => this.store.data.byQuery[id],
      onLoading : request => this.store.byQueryLoading(request, id),
      onLoad : result => this.store.byQueryLoaded(result.body, id),
      onError : e => this.store.byQueryError(e, id)
    });
  }



}

const service = new SeparationService();
export default service;
