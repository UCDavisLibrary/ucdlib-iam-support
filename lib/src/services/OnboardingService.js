import BaseService from './BaseService.js';
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

  reconcile(onboardingId, iamId){
    return this.request({
      url : '/api/onboarding/reconcile',
      fetchOptions : {
        method : 'POST',
        body : {onboardingId, iamId}
      },
      json: true,
      onLoading : request => this.store.reconciliationLoading(request, onboardingId),
      onLoad : result => this.store.reconciliationLoaded(result.body, onboardingId),
      onError : e => this.store.reconciliationError(e, onboardingId)
    });
  }

  backgroundCheck(onboardingId, payload){
    return this.request({
      url : `/api/onboarding/${onboardingId}/background-check-notification`,
      fetchOptions : {
        method : 'POST',
        body : payload
      },
      json: true,
      onLoading : request => this.store.backgroundCheckLoading(request, onboardingId),
      onLoad : result => this.store.backgroundCheckLoaded(result.body, onboardingId),
      onError : e => this.store.backgroundCheckError(e, onboardingId)
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

  recordSearch(q){
    return this.request({
      url : `/api/onboarding/search?${q}`,
      // checkCached: () => this.store.data.byRecord[q],
      onLoading : request => this.store.byRecordLoading(request, q),
      onLoad : result => this.store.byRecordLoaded(result.body, q),
      onError : e => this.store.byRecordError(e, q)
    });
  }

  query(id){
    return this.request({
      url : `/api/onboarding${id != 'all' ? '?' + id: ''}`,
      checkCached: () => this.store.data.byQuery[id],
      onLoading : request => this.store.byQueryLoading(request, id),
      onLoad : result => this.store.byQueryLoaded(result.body, id),
      onError : e => this.store.byQueryError(e, id)
    });
  }



}

const service = new OnboardingService();
export default service;
