import {BaseService} from '@ucd-lib/cork-app-utils';
import UcdIamStore from '../stores/UcdIamStore.js';

class UcdIamService extends BaseService {

  constructor() {
    super();
    this.store = UcdIamStore;

    // profile is the better endpoint (it has more data)
    // but it does not support all search params
    this.searchEndpoints = {
      people: {id: 'people', path: 'people/search'},
      profile: {id: 'profile', path: 'people/profile/search'}
    };
    this.searchParamToEndpoint = {
      studentId: this.searchEndpoints.people,
      employeeId: this.searchEndpoints.people,
      iamId: this.searchEndpoints.profile,
      userId: this.searchEndpoints.profile,
      email: this.searchEndpoints.profile,
      name: this.searchEndpoints.people
    }
  }

  async getPersonById(id, idType) {
    const url = `${this.config.url}/${this.searchParamToEndpoint[idType].path}`;
    let storeKey = `${idType}:${id}`;
    const store = this.store.data.getById;

    const params = new URLSearchParams({v: this.config.version, key: this.config.key});
    params.set(idType, id);

    await this.checkRequesting(
      storeKey, store,
      () => this.request({
        url : `${url}?${params.toString()}`,
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
    const url = `${this.config.url}/${this.searchParamToEndpoint['name'].path}`;
    const store = this.store.data.getByName;
    const cacheParams = this._makeNameQuery(last, first, middle, useDirectory);
    const id = cacheParams.toString();
    const urlParams = this._makeNameQuery(last, first, middle, useDirectory);
    urlParams.set('v', this.config.version);
    urlParams.set('key', this.config.key);

    await this.checkRequesting(
      id, store,
      () => this.request({
        url : `${url}?${urlParams.toString()}`,
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
    const prefix = useDirectory ? 'd' : 'o';
    const params = new URLSearchParams();
    ['last', 'middle', 'first'].forEach(n => {
      const v = eval(n);
      if ( v ){
        const k = prefix + n.charAt(0).toUpperCase() + n.slice(1) + 'Name';
        params.set(k, v)
      }
    })
    return params;
  }

}

const service = new UcdIamService();
export default service;