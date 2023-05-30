import {BaseStore} from '@ucd-lib/cork-app-utils';

class RtStore extends BaseStore {

  constructor() {
    super();

    this.data = {
      history: {}
    };
    this.events = {
      RT_TICKET_HISTORY_FETCH: 'rt-ticket-history-fetch',
      RT_TICKET_HISTORY_REQUEST: 'rt-ticket-history-request'
    };
  }

  historyLoading(request, id) {
    this._setHistoryState({
      state : this.STATE.LOADING,
      request
    }, id);
  }

  historyLoaded(payload, id) {
    this._setHistoryState({
      state : this.STATE.LOADED,
      payload
    }, id);
  }

  historyError(error, id) {
    this._setHistoryState({
      state : this.STATE.ERROR,
      error
    }, id);
  }

  _setHistoryState(state, id) {
    this.data.history[id] = {...state, id};
    this.emit(this.events.RT_TICKET_HISTORY_FETCH, state);
  }


}

const store = new RtStore();
export default store;
