import BaseService from './BaseService.js';
import GroupStore from '../stores/GroupStore.js';

class GroupService extends BaseService {

  constructor() {
    super();
    this.store = GroupStore;
  }

  get baseUrl(){
    return `/api/groups`;
  }

  async list(){
    const store = this.store.data.list;
    const id = 'list';

    await this.checkRequesting(
      id, store,
      () => this.request({
        url : `${this.baseUrl}`,
        checkCached : () => store.get(id),
        onUpdate : resp => this.store.set(
          {...resp, id},
          store
        )
      })
    );

    return store.get(id);
  }

  async get(id){
    const store = this.store.data.get;

    await this.checkRequesting(
      id, store,
      () => this.request({
        url : `${this.baseUrl}/${id}`,
        checkCached : () => store.get(id),
        onUpdate : resp => this.store.set(
          {...resp, id},
          store
        )
      })
    );

    return store.get(id);
  }

  async setHead(id, payload){
    const store = this.store.data.setHead;

    await this.checkRequesting(
      id, store,
      () => this.request({
        url : `${this.baseUrl}/sethead/${id}`,
        fetchOptions : {
          method : 'POST',
          body : payload
        },
        json: true,
        onUpdate : resp => this.store.set(
          {...resp, id},
          store
        )
      })
    );

    return store.get(id);
  }

  async removeHead(id){
    const store = this.store.data.removeHead;

    await this.checkRequesting(
      id, store,
      () => this.request({
        url : `${this.baseUrl}/removehead/${id}`,
        fetchOptions : {
          method : 'POST'
        },
        json: true,
        onUpdate : resp => this.store.set(
          {...resp, id},
          store
        )
      })
    );

    return store.get(id);
  }

}

const service = new GroupService();
export default service;