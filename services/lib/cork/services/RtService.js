import BaseService from './BaseService.js';
import RtStore from '../stores/RtStore.js';

class RtService extends BaseService {

  constructor() {
    super();
    this.store = RtStore;
  }

  get baseUrl(){
    return `/api/rt`;
  }

  async getTicketHistory(id) {
    const store = this.store.data.ticketHistory;

    await this.checkRequesting(
      id, store,
      () => this.request({
        url : `${this.baseUrl}/history/${id}`,
        checkCached : () => store.get(id),
        onUpdate : resp => this.store.set(
          {...resp, id},
          store
        )
      })
    );

    return store.get(id);
  }

}

const service = new RtService();
export default service;