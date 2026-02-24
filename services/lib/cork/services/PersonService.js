import BaseService from './BaseService.js';
import PersonStore from '../stores/PersonStore.js';

class PersonService extends BaseService {

  constructor() {
    super();
    this.store = PersonStore;
  }

  async getPersonById(id, idType) {
    const url = `${this.store.searchParams[idType].endpoint}/${id}`;
    const storeKey = `${idType}:${id}`;
    const store = this.store.data.getById;

    await this.checkRequesting(
      storeKey, store,
      () => this.request({
        url : url,
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

  async getPersonByName(last, first, middle, useDirectory){
    const url = this.store.searchParams.name.endpoint;
    const params = this._makeNameQuery(last, first, middle, useDirectory);
    const id = params.toString();
    const store = this.store.data.getByName;

    await this.checkRequesting(
      id, store,
      () => this.request({
        url : `${url}?${id}`,
        checkCached : () => store.get(id),
        onUpdate : resp => this.store.set(
          {...resp, id},
          store
        )
      })
    );
    return store.get(id);
  }

  _makeNameQuery(last, first, middle, useDirectory){
    const params = new URLSearchParams();
    ['last', 'middle', 'first'].forEach(n => {
      const v = eval(n);
      if ( v ){
        const k = n + 'Name';
        params.set(k, v)
      }
    })
    if ( useDirectory ){
      params.set('useDirectory', true);
    }
    params.sort();
    return params;
  }

}

const service = new PersonService();
export default service;