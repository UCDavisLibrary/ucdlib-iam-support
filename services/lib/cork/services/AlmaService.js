import BaseService from './BaseService.js';
import AlmaStore from '../stores/AlmaStore.js';

import config from '#lib/utils/config.js';
import payload from '../utils/payload.js';


class AlmaService extends BaseService {

  constructor() {
    super();
    this.store = AlmaStore;
  }

  async getRoles(){
    const store = this.store.data.roles;
    const id = 'roles';
    await this.checkRequesting(
      id, store,
      () => this.request({
        url : `${config.alma.url}conf/code-tables/HFrUserRoles.roleType?limit=100&offset=0&apikey=${config.alma.key}&format=json`,
        checkCached : () => store.get(id),
        onUpdate : resp => this.store.set(
          {...resp, id},
          store
        )
      })
    );

    return store.get(id);
  }

  async getUserById(id){
    const store = this.store.data.getUserById;

    await this.checkRequesting(
      id, store,
      () => this.request({
        url : `${config.alma.url}users/${id}?apikey=${config.alma.key}&format=json`,
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
    const queryParam = this._makeNameQuery(lastName, firstName);

    await this.checkRequesting(
      id, store,
      () => this.request({
        url : `${config.alma.url}users?apikey=${config.alma.key}&format=json&${decodeURIComponent(queryParam.toString())}`,
        checkCached : () => store.get(id),
        onUpdate : resp => this.store.set(
          payload.generate(ido, resp),
          store
        )
      })
    );

    return store.get(id);
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