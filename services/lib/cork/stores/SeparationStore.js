import {BaseStore, LruStore} from '@ucd-lib/cork-app-utils';

class SeparationStore extends BaseStore {

  constructor() {
    super();

    this.data = {
      query: new LruStore({name: 'separation.query'}),
      create: new LruStore({name: 'separation.create'}),
      get: new LruStore({name: 'separation.get'}),
      byRecord: {},
      deprovision: new LruStore({name: 'separation.deprovision'})
    };
    this.events = {
      SEPARATION_RECORD: 'separation-record'
    };
  }

  byRecordLoading(request, query) {
    this._setByRecordstate({
      state : this.STATE.LOADING,
      request
    }, query);
  }

  byRecordLoaded(payload, query) {
    this._setByRecordstate({
      state : this.STATE.LOADED,
      payload
    }, query);
  }

  byRecordError(error, query) {
    this._setByRecordstate({
      state : this.STATE.ERROR,
      error
    }, query);
  }

  _setByRecordstate(state) {
    this.data.byRecord["result"] = state;
    this.emit(this.events.SEPARATION_RECORD, state);
  }
}

const store = new SeparationStore();
export default store;
