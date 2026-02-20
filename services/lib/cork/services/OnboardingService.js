import BaseService from './BaseService.js';
import OnboardingStore from '../stores/OnboardingStore.js';

import { digest } from '@ucd-lib/cork-app-utils';
import payload from '../utils/payload.js';

class OnboardingService extends BaseService {

  constructor() {
    super();
    this.store = OnboardingStore;
  }

  get baseUrl(){
    return `/api/onboarding`;
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

  async reconcile(onboardingId, iamId) {
    const store = this.store.data.reconciliation;
    const id = onboardingId;
    
    await this.checkRequesting(
      id, store,
      () => this.request({
        url : `${this.baseUrl}/reconcile`,
        json: true,
        fetchOptions: { 
          method: 'POST',
          body: { onboardingId, iamId }
        },
        onUpdate : resp => this.store.set(
          {...resp, id},
          store
        )
      })
    );
    return store.get(id);
  }

  async backgroundCheck(id, data) {
    const store = this.store.data.backgroundCheck;

    await this.checkRequesting(
      id, store,
      () => this.request({
        url : `${this.baseUrl}/${id}/background-check-notification`,
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

  async adoptEmployee(id) {
    const store = this.store.data.adopt;

    await this.checkRequesting(
      id, store,
      () => this.request({
        url : `${this.baseUrl}/${id}/adopt`,
        json: true,
        fetchOptions: { 
          method: 'POST'
        },
        onUpdate : resp => this.store.set(
          {...resp, id},
          store
        )
      })
    );
    return store.get(id);
  }

  async get(onboardingId){
    const ido = { entityId: onboardingId };
    const id = payload.getKey(ido);
    const store = this.store.data.get;

    await this.checkRequesting(
      id, store,
      () => this.request({
        url : `${this.baseUrl}/${onboardingId}`,
        checkCached : () => store.get(id),
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

const service = new OnboardingService();
export default service;
