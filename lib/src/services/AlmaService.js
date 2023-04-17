import BaseService from './BaseService.js';
import AlmaStore from '../stores/AlmaStore.js';

class AlmaService extends BaseService {

  constructor() {
    super();
    this.store = AlmaStore;


    this.searchEndpoints = {
      roles: {id: 'roles', path: 'conf/code-tables/HFrUserRoles.roleType?limit=100&offset=0&'},
      users: {id: 'users', path: 'users'},
      limit: {id: 'limit', path: '?limit=100&offset=0&'},
    };
  }

  getRoles(key){
    return this.request({
      url : `${this.config.url}${this.searchEndpoints.roles.path}${this.searchEndpoints.limit.path}apikey=${key}`,
      onLoading : request => this.store.getRolesLoading(request),
      checkCached : () => this.store.data.roles,
      onLoad : result => this.store.getRolesLoaded(result.body),
      onError : e => this.store.getRolesError(e)
    });
  }

  getUsers(key){
    return this.request({
      url : `${this.config.url}${this.searchEndpoints.users.path}${this.searchEndpoints.limit.path}apikey=${key}`,
      onLoading : request => this.store.getUsersLoading(request),
      checkCached : () => this.store.data.users,
      onLoad : result => this.store.getUsersLoaded(result.body),
      onError : e => this.store.getUsersError(e)
    });
  }

  getUsersById(id, key) {
    const url = `${this.config.url}${this.searchEndpoints.users.path}/${id}?apikey=${key}`;
    return this.request({
      url : `${url}`,
      onLoading : request => this.store.getUsersByIdLoading(id, request),
      onLoad : result => this.store.getUsersByIdLoaded(id, result.body),
      onError : e => this.store.getUsersByIdError(id, e)
    });
  }

  getUsersByName(last, first, key){
    const url = `${this.config.url}${this.searchEndpoints.users.path}?apikey=${key}&`;
    const cacheParams = this._makeNameQuery(last, first);
    const urlParams = this._makeNameQuery(last, first);
    return this.request({
      url : `${url}${decodeURIComponent(urlParams.toString())}`,
      onLoading : request => this.store.getUsersByNameLoading(cacheParams, request),
      onLoad : result => this.store.getUsersByNameLoaded(cacheParams, result.body),
      onError : e => this.store.getUsersByNameError(cacheParams, e)
    });
  }

  _makeNameQuery(last, first){
    const params = new URLSearchParams();
    let k = '';
    ['last', 'first'].forEach(n => {
      const v = eval(n);
      if ( v ){
        k += n + '_name~' + v + '+';
      }
    })
    params.set("q", k);
    return params;
  }




}

const service = new AlmaService();
export default service;