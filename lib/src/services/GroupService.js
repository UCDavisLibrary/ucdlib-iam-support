import BaseService from './BaseService.js';
import GroupStore from '../stores/GroupStore.js';

class GroupService extends BaseService {

  constructor() {
    super();
    this.store = GroupStore;
  }

  getGroups(){
    return this.request({
      url : '/api/groups',
      onLoading : request => this.store.getGroupsLoading(request),
      checkCached : () => this.store.data.groups,
      onLoad : result => this.store.getGroupsLoaded(result.body),
      onError : e => this.store.getGroupsError(e)
    });
  }

}

const service = new GroupService();
export default service;