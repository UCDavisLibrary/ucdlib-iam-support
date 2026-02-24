import BaseService from './BaseService.js';
import PermissionsStore from '../stores/PermissionsStore.js';

class PermissionsService extends BaseService {

  constructor() {
    super();
    this.store = PermissionsStore;
  }


  async create(data) {
    const id = (new Date()).toISOString();
    const store = this.store.data.create;

    await this.checkRequesting(
      id, store,
      () => this.request({
        url : `/api/permissions`,
        json: true,
        fetchOptions: { 
          method: 'POST',
          body: data
        },
        onUpdate : resp => this.store.set(
          {...resp, id},
          store
        )
      })
    );
    return store.get(id);
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

  async getOwn(){
    const id = 'own';
    const store = this.store.data.query;

    await this.checkRequesting(
      id, store,
      () => this.request({
        url : `/api/submitted-permission-requests`,
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

const service = new PermissionsService();
export default service;
