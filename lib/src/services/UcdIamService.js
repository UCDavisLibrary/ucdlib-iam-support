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

  getPersonById(id, idType) {
    const url = `${this.config.url}/${this.searchParamToEndpoint[idType].path}`;
    console.log("there");

    const params = new URLSearchParams({v: this.config.version, key: this.config.key});
    params.set(idType, id);
    return this.request({
      url : `${url}?${params.toString()}`,
      onLoading : request => this.store.getPersonByIdLoading(id, idType, request),
      onLoad : result => this.store.getPersonByIdLoaded(id, idType, result.body),
      onError : e => this.store.getPersonByIdError(id, idType, e)
    });
  }

  getPersonByName(last, first, middle, useDirectory){
    const url = `${this.config.url}/${this.searchParamToEndpoint['name'].path}`;
    const cacheParams = this._makeNameQuery(last, first, middle, useDirectory);
    const urlParams = this._makeNameQuery(last, first, middle, useDirectory);
    urlParams.set('v', this.config.version);
    urlParams.set('key', this.config.key);

    return this.request({
      url : `${url}?${urlParams.toString()}`,
      onLoading : request => this.store.getPersonByNameLoading(cacheParams, request),
      onLoad : result => this.store.getPersonByNameLoaded(cacheParams, result.body),
      onError : e => this.store.getPersonByNameError(cacheParams, e)
    });
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