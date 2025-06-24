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

  getById(id){
    return this.request({
      url : `/api/groups/${id}`,
      onLoading : request => this.store.getByIdLoading(id, request),
      checkCached : () => this.store.data.groupById,
      onLoad : result => this.store.getByIdLoaded(id, result.body),
      onError : e => this.store.getByIdError(id, e)
    });
  }

  setGroupHead(id, payload){
    return this.request({
      url : `/api/groups/sethead/${id}`,
      fetchOptions : {
        method : 'POST',
        body : payload
      },
      json: true,
      onLoading : request => this.store.setGroupHeadLoading(request, id),
      checkCached : () => this.store.data.setGroupHead,
      onLoad : result => this.store.setGroupHeadLoaded(result.body, id),
      onError : e => this.store.setGroupHeadError(e, id)
    });
  }

  removeGroupHead(id, payload){
    return this.request({
      url : `/api/groups/removehead/${id}`,
      fetchOptions : {
        method : 'POST',
        body : payload
      },
      json: true,
      onLoading : request => this.store.removeGroupHeadLoading(request, id),
      checkCached : () => this.store.data.removeGroupHead,
      onLoad : result => this.store.removeGroupHeadLoaded(result.body, id),
      onError : e => this.store.removeGroupHeadError(e, id)
    });
  }

}

const service = new GroupService();
export default service;