import BaseService from './BaseService.js';
import RosettaStore from '../stores/RosettaStore.js';
import payload from '../utils/payload.js';

class RosettaService extends BaseService {

  constructor() {
    super();
    this.store = RosettaStore;
  }

  get baseUrl(){
    return `/api/rosetta`;
  }

  async getPersonById(id, idType='iamId'){
    const store = this.store.data.getPerson;
    const ido = { entityId: id, idType };
    const storeId = payload.getKey(ido);

    await this.checkRequesting(
      storeId, store,
      () => this.request({
        url : `${this.baseUrl}/person/${id}`,
        qs: { idType },
        checkCached : () => store.get(storeId),
        onUpdate : resp => this.store.set(
          payload.generate(ido, resp),
          store
        )
      })
    );

    return store.get(storeId);
  }

  async getPersonByName(query={}){
    const store = this.store.data.searchPeople;
    const ido = { ...query, action: 'search' };
    const storeId = payload.getKey(ido);

    await this.checkRequesting(
      storeId, store,
      () => this.request({
        url : `${this.baseUrl}/person`,
        qs: ido,
        checkCached : () => store.get(storeId),
        onUpdate : resp => this.store.set(
          payload.generate(ido, resp),
          store
        )
      })
    );

    return store.get(storeId);
  }

}

const service = new RosettaService();
export default service;