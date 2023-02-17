import {BaseService} from '@ucd-lib/cork-app-utils';
import OnboardingStore from '../stores/OnboardingStore.js';

class OnboardingService extends BaseService {

  constructor() {
    super();
    this.store = OnboardingStore;
  }

  newSubmission(timestamp, payload) {
    return this.request({
      url : '/api/onboarding/new',
      fetchOptions : {
        method : 'POST',
        body : payload
      },
      json: true,
      onLoading : request => this.store.postNewLoading(request, timestamp, payload),
      onLoad : result => this.store.postNewLoaded(result.body, timestamp),
      onError : e => this.store.postNewError(e, timestamp, payload)
    });
  }

  getById(id){
    return this.request({
      url : '/api/onboarding/' + id,
      checkCached: () => this.store.data.byId[id],
      onLoading : request => this.store.byIdLoading(request, id),
      onLoad : result => this.store.byIdLoaded(result.body, id),
      onError : e => this.store.byIdError(e, id)
    });
  }

}

const service = new OnboardingService();
export default service;