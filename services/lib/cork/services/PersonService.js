import BaseService from './BaseService.js';
import PersonStore from '../stores/PersonStore.js';

class PersonService extends BaseService {

  constructor() {
    super();
    this.store = PersonStore;
  }

  getPeopleByIds(ids, event) {
    const url = `${this.store.searchParams[bulk].endpoint}`;
    const params = new URLSearchParams();
    params.set('ids', ids);
    return this.request({
      url : `${url}?${params.toString()}`,
      onLoading : request => this.store.getPeopleByIdsLoading(ids, request, event),
      checkCached : () => this.store.data.bulk[ids],
      onLoad : result => this.store.getPeopleByIdsLoaded(ids, result.body, event),
      onError : e => this.store.getPeopleByIdsError(ids, e, event)
    });
  }

  getPersonById(id, idType, event) {
    const url = `${this.store.searchParams[idType].endpoint}/${id}`;
    const params = new URLSearchParams();
    params.set('idType', idType);
    return this.request({
      url : `${url}?${params.toString()}`,
      onLoading : request => this.store.getPersonByIdLoading(id, idType, request, event),
      checkCached : () => this.store.data[idType][id],
      onLoad : result => this.store.getPersonByIdLoaded(id, idType, result.body, event),
      onError : e => this.store.getPersonByIdError(id, idType, e, event)
    });
  }

  getPersonByName(last, first, middle, useDirectory){
    const url = this.store.searchParams.name.endpoint;
    const params = this._makeNameQuery(last, first, middle, useDirectory);

    return this.request({
      url : `${url}?${params.toString()}`,
      onLoading : request => this.store.getPersonByNameLoading(params, request),
      //checkCached : () => this.store.data.name[params.toString()],
      onLoad : result => this.store.getPersonByNameLoaded(params, result.body),
      onError : e => this.store.getPersonByNameError(params, e)
    });
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
    return params;
  }

}

const service = new PersonService();
export default service;