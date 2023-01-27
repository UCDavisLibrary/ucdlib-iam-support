import {BaseService} from '@ucd-lib/cork-app-utils';
import UcdIamStore from '../stores/UcdIamStore.js';

class UcdIamService extends BaseService {

  constructor() {
    super();
    this.store = UcdIamStore;

    // profile is the better endpoint (it has more data)
    // but it does not support a lot of search params
    this.searchEndpoints = {
      people: {id: 'people', path: 'people/search'},
      profile: {id: 'profile', path: 'people/profile/search'}
    };
    this.searchParamToEndpoint = {
      studentId: this.searchEndpoints.people,
      employeeId: this.searchEndpoints.people,
      iamId: this.searchEndpoints.profile,
      userId: this.searchEndpoints.profile,
      email: this.searchEndpoints.profile
    }
  }

  getPersonById(id, idType) {
    const url = `${this.config.url}/${this.searchParamToEndpoint[idType].path}`;
    const params = new URLSearchParams({v: this.config.version, key: this.config.key});
    params.set(idType, id);
    return this.request({
      url : `${url}?${params.toString()}`,
      onLoading : request => this.store.getPersonByIdLoading(id, idType, request),
      onLoad : result => this.store.getPersonByIdLoaded(id, idType, result.body),
      onError : e => this.store.getPersonByIdError(id, idType, e)
    });
  }

}

const service = new UcdIamService();
export default service;