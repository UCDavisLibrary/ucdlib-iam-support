const {AppStateModel} = require('@ucd-lib/cork-app-state');
const AppStateStore = require('../stores/AppStateStore');

class AppStateModelImpl extends AppStateModel {

  constructor() {
    super();

    this.defaultPage = 'home';
    this.store = AppStateStore;
  }

  set(update) {
    if( !update.location.path.length ) {
      update.page = this.defaultPage;
    } else {
      update.path = update.location.path[0];
    }
    
    let res = super.set(update);

    return res;
  }
}
  
  module.exports = new AppStateModelImpl();

