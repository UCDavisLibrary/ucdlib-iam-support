import {BaseStore} from '@ucd-lib/cork-app-utils';

class OrgchartStore extends BaseStore {

  constructor() {
    super();

    this.data = {
      orgchart: {}
    };
    this.events = {
      ORGCHART_FETCHED: 'orgchart-fetched',
    };
  }

  getOrgchartLoading(request) {
    this._setOrgchartState({
      state : this.STATE.LOADING,
      request
    });
  }

  getOrgchartLoaded(payload) {
    this._setOrgchartState({
      state : this.STATE.LOADED,
      payload
    });
  }

  getOrgchartError(error) {
    this._setOrgchartState({
      state : this.STATE.ERROR,
      error
    });
  }

  _setOrgchartState(state) {
    this.data.orgchart = state;
    this.emit(this.events.ORGCHART_FETCHED, state);
  }

}

const store = new OrgchartStore();
export default store;