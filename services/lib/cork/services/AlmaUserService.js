import BaseService from './BaseService.js';
import AlmaUserStore from '../stores/AlmaUserStore.js';

import payload from '../utils/payload.js';

class AlmaUserService extends BaseService {

  constructor() {
    super();
    this.store = AlmaUserStore;
  }

  get baseUrl(){
    return `/api/alma`;
  }

  async getUserById(id){
    const store = this.store.data.getUserById;

    await this.checkRequesting(
      id, store,
      () => this.request({
        url : `${this.baseUrl}/users/${id}`,
        checkCached : () => store.get(id),
        onUpdate : resp => this.store.set(
          {...resp, id},
          store
        )
      })
    );

    return store.get(id);
  }

  async queryUserByName(lastName, firstName){
    const store = this.store.data.queryUserByName;
    const ido = { lastName, firstName };
    const id = payload.getKey(ido);

    await this.checkRequesting(
      id, store,
      () => this.request({
        url : `${this.baseUrl}/users/search`,
        qs: ido,
        checkCached : () => store.get(id),
        onUpdate : resp => this.store.set(
          payload.generate(ido, resp),
          store
        )
      })
    );

    return store.get(id);
  }

  async getRoleTypes(){
    const store = this.store.data.getRoleTypes;
    const id = 'roleTypes';

    await this.checkRequesting(
      id, store,
      () => this.request({
        url : `${this.baseUrl}/roleTypes`,
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

const service = new AlmaUserService();
export default service;