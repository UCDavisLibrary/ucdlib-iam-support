import BaseService from './BaseService.js';
import EmployeeStore from '../stores/EmployeeStore.js';
import payload from '../utils/payload.js';

class EmployeeService extends BaseService {

  constructor() {
    super();
    this.store = EmployeeStore;
  }

  get baseUrl(){
    return `/api/employees`;
  }

  async getDirectReports(){
    const store = this.store.data.directReports;
    const id = 'directReports';

    await this.checkRequesting(
      id, store,
      () => this.request({
        url : `${this.baseUrl}/direct-reports`,
        checkCached : () => store.get(id),
        onUpdate : resp => this.store.set(
          {...resp, id},
          store
        )
      })
    );

    return store.get(id);
  }

  async searchByName(name){
    const store = this.store.data.query;
    const ido = { name };
    const id = payload.getKey(ido);

    await this.checkRequesting(
      id, store,
      () => this.request({
        url : `${this.baseUrl}/search`,
        qs: ido,
        checkCached : () => store.get(id),
        onUpdate : resp => this.store.set(
          payload.generate(ido, resp),
          store
        )
      })
    );

    return store.get(id);
  }

  async get(id, idType){
    const store = this.store.data.get;
    const ido = { id, idType };
    const storeId = payload.getKey(ido);

    await this.checkRequesting(
      storeId, store,
      () => this.request({
        url : `${this.baseUrl}/${id}`,
        qs: { idType },
        checkCached : () => store.get(storeId),
        onUpdate : resp => this.store.set(
          payload.generate(ido, resp),
          store
        )
      })
    );

    return store.get(storeId);
  }

  async update(id, payload){
    const store = this.store.data.update;
    
    await this.checkRequesting(
      id, store,
      () => this.request({
        url : `${this.baseUrl}/${id}`,
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

  async addToGroup(id, payload){
    const store = this.store.data.addToGroup;
    
    await this.checkRequesting(
      id, store,
      () => this.request({
        url : `${this.baseUrl}/addgroup/${id}`,
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

  async removeFromGroup(id, payload){
    const store = this.store.data.removeFromGroup;
    
    await this.checkRequesting(
      id, store,
      () => this.request({
        url : `${this.baseUrl}/removegroup/${id}`,
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

  async getActiveDiscrepancy(id){
    const store = this.store.data.activeDiscrepancies;

    await this.checkRequesting(
      id, store,
      () => this.request({
        url : `${this.baseUrl}/${id}/discrepancies`,
        checkCached : () => store.get(id),
        onUpdate : resp => this.store.set(
          {...resp, id},
          store
        )
      })
    );

    return store.get(id);
  }

  async dismissDiscrepancies(id, discrepanciesList){
    const store = this.store.data.dismissDiscrepancies;
    
    await this.checkRequesting(
      id, store,
      () => this.request({
        url : `${this.baseUrl}/${id}/discrepancies`,
        fetchOptions : {
          method : 'POST',
          body: discrepanciesList
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

const service = new EmployeeService();
export default service;
