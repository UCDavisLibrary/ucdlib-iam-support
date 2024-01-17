import BaseService from './BaseService.js';
import AlmaUserStore from '../stores/AlmaUserStore.js';

class AlmaUserService extends BaseService {

  constructor() {
    super();
    this.store = AlmaUserStore;
  }

  getAlmaUserRoleType(){
    return this.request({
      url : `/api${this.store.searchParams.roleType.endpoint}`,
      onLoading : request => this.store.getAlmaUserRoleTypeLoading(request),
      checkCached : () => this.store.data.roleType,
      onLoad : result => this.store.getAlmaUserRoleTypeLoaded(result.body),
      onError : e => this.store.getAlmaUserRoleTypeError(e)
    });
  }

  getAlmaUserById(id, idType, event) {
    const url = `/api${this.store.searchParams[idType].endpoint}/${id}`;
    return this.request({
      url : `${url}`,
      onLoading : request => this.store.getAlmaUserByIdLoading(id, idType, request, event),
      checkCached : () => this.store.data[idType][id],
      onLoad : result => this.store.getAlmaUserByIdLoaded(id, idType, result.body, event),
      onError : e => this.store.getAlmaUserByIdError(id, idType, e, event)
    });
  }

  getAlmaUserByIds(ids, event) {
    const url = `/api${this.store.searchParams[bulk].endpoint}`;
    const params = new URLSearchParams();
    params.set('ids', ids);
    return this.request({
      url : `${url}?${params.toString()}`,
      onLoading : request => this.store.getAlmaUserByIdsLoading(ids, request, event),
      checkCached : () => this.store.data.bulk[ids],
      onLoad : result => this.store.getAlmaUserByIdsLoaded(ids, result.body, event),
      onError : e => this.store.getAlmaUserByIdsError(ids, e, event)
    });
  }


  getAlmaUserByName(last, first){
    const url = this.store.searchParams.name.endpoint;
    const params = this._makeNameQuery(last, first);
    return this.request({
      url : `/api${url}?${decodeURIComponent(params.toString())}`,
      onLoading : request => this.store.getAlmaUserByNameLoading(params, request),
      //checkCached : () => this.store.data.name[params.toString()],
      onLoad : result => this.store.getAlmaUserByNameLoaded(params, result.body),
      onError : e => this.store.getAlmaUserByNameError(params, e)
    });
  }

  _makeNameQuery(last, first){
    let params = new URLSearchParams();
    let k = '';
    ['last', 'first'].forEach(n => {
      const v = eval(n);
      if ( v ){
        k += n + 'Name=' + v + '&';
      }
    })
    params = k;
    // params.set("", k);
    return params;
  }

}

const service = new AlmaUserService();
export default service;