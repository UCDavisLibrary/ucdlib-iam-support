import BaseService from './BaseService.js';
import RolesStore from '../stores/RolesStore.js';

class RolesService extends BaseService {

  constructor() {
    super();
    this.store = RolesStore;
  }

  getRoles(){
    return this.request({
      url : '/api/roles',
      onLoading : request => this.store.getRolesLoading(request),
      checkCached : () => this.store.data.roles,
      onLoad : result => this.store.getRolesLoaded(result.body),
      onError : e => this.store.getRolesError(e)
    });
  }

}

const service = new RolesService();
export default service;