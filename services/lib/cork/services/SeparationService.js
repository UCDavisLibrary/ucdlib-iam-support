import BaseService from './BaseService.js';
import { digest } from '@ucd-lib/cork-app-utils';
import SeparationStore from '../stores/SeparationStore.js';

import payload from '../utils/payload.js';

class SeparationService extends BaseService {

  constructor() {
    super();
    this.store = SeparationStore;
  }

  get baseUrl(){
    return `/api/separation`;
  }

  async create(data) {
    const id = (new Date()).toISOString();
    const store = this.store.data.create;

    await this.checkRequesting(
      id, store,
      () => this.request({
        url : `${this.baseUrl}/new`,
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

  async get(separationId){
    const ido = { entityId: separationId };
    const id = payload.getKey(ido);
    const store = this.store.data.get;

    await this.checkRequesting(
      id, store,
      () => this.request({
        url : `${this.baseUrl}/${separationId}`,
        checkCached : () => store.get(id),
        onUpdate : resp => this.store.set(
          payload.generate(ido, resp),
          store
        )
      })
    );

    return store.get(id);
  }

  async deprovision(separationId) {
    const ido = { entityId: separationId };
    const id = payload.getKey(ido);
    const store = this.store.data.deprovision;

    await this.checkRequesting(
      id, store,
      () => this.request({
        url : `${this.baseUrl}/${separationId}/deprovision`,
        fetchOptions: { 
          method: 'POST'
        },
        onUpdate : resp => this.store.set(
          payload.generate(ido, resp),
          store
        )
      })
    );
    return store.get(id);
  }

  async queryByName(query){
    const id = await digest(query);
    const store = this.store.data.byName;
    
    await this.checkRequesting(
      id, store,
      () => this.request({
        url : `${this.baseUrl}/search`,
        qs: query,
        checkCached : () => store.get(id),
        onUpdate : resp => this.store.set(
          {...resp, id},
          store
        )
      })
    );
    return store.get(id);
  }

  async query(query){
    if ( !query.limit ) query.limit = 25;
    let id = await digest(query);
    const store = this.store.data.query;

    await this.checkRequesting(
      id, store,
      () => this.request({
        url : `${this.baseUrl}`,
        qs: query,
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

const service = new SeparationService();
export default service;
