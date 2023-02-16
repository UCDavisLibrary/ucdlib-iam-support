const {AppStateStore} = require('@ucd-lib/cork-app-state');

class AppStateStoreImpl extends AppStateStore {
  constructor() {
    super();
    this.lastPage = 'home';
    this.events.APP_STATUS_CHANGE = 'app-status-change';
  }
}

module.exports = new AppStateStoreImpl();