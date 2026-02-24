import BaseService from './BaseService.js';
import OrgchartStore from '../stores/OrgchartStore.js';

class OrgchartService extends BaseService {

  constructor() {
    super();
    this.store = OrgchartStore;
  }

  async create(data) {
    const id = (new Date()).toISOString();
    const store = this.store.data.create;

    await this.checkRequesting(
      id, store,
      () => this.request({
        url : `/api/orgchart`,
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

}

const service = new OrgchartService();
export default service;