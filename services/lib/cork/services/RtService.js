import BaseService from './BaseService.js';
import RtStore from '../stores/RtStore.js';

class RtService extends BaseService {

  constructor() {
    super();
    this.store = RtStore;
  }

  getHistory(id){
    return this.request({
      url : '/api/rt/history/' + id,
      checkCached: () => this.store.data.history[id],
      onLoading : request => this.store.historyLoading(request, id),
      onLoad : result => this.store.historyLoaded(result.body, id),
      onError : e => this.store.historyError(e, id)
    });
  }

}

const service = new RtService();
export default service;