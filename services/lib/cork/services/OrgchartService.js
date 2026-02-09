import BaseService from './BaseService.js';
import OrgchartStore from '../stores/OrgchartStore.js';

class OrgchartService extends BaseService {

  constructor() {
    super();
    this.store = OrgchartStore;
  }

  orgPush(payload){
    return this.request({
      url : '/api/orgchart',
      fetchOptions : {
        method : 'POST',
        body : payload
      },
      json: true,
      onLoading : request => this.store.getOrgchartLoading(request),
      checkCached : () => this.store.data.orgchart,
      onLoad : result => this.store.getOrgchartLoaded(result.body),
      onError : e => this.store.getOrgchartError(e)
    });
  }

}

const service = new OrgchartService();
export default service;