const {AppStateModel} = require('@ucd-lib/cork-app-state');
const AppStateStore = require('../stores/AppStateStore');

/**
 * @description Model for handling generic app state, such as routing
 */
class AppStateModelImpl extends AppStateModel {

  constructor() {
    super();

    this.defaultPage = 'home';
    this.store = AppStateStore;
  }

  /**
   * @description Sets the current route state
   * @param {Object} update - Route state - Returned in AppStateUpdate
   * @returns 
   */
  set(update) {
    
    this.setPage(update);
    this.setTitle(update);
    this.setBreadcrumbs(update);
    
    let res = super.set(update);

    return res;
  }

  /**
   * @description Sets page data for route
   * @param {Object} update 
   */
  setPage(update){
    if( 
      !update.location.path.length ||
      !update.location.path[0]
    ) {
      update.page = this.defaultPage;
    } else if(
      update.location.path[0] == 'onboarding' &&
      update.location.path.length > 1 &&
      update.location.path[1] == 'new'
    ) {
      update.page = 'onboarding-new';
    }else {
      update.page = update.location.path[0];
    }

  }

  /**
   * @description Sets title of page
   * @param {Object} update 
   */
  setTitle(update){
    const title = {
      show: false,
      text: ''
    };
    if ( update.page === 'onboarding' ){
      title.show = true;
      title.text = 'Onboarding';
    } else if ( update.page === 'separation' ){
      title.show = true;
      title.text = 'Separation';
    } else if ( update.page === 'onboarding-new' ){
      title.show = true;
      title.text = 'New Onboarding Request';
    }

    update.title = title;
  }

  /**
   * @description Sets breadcrumbs for route
   * @param {Object} update 
   */
  setBreadcrumbs(update){
    const homeCrumb = {text: 'Home', link: '/'};
    const breadcrumbs = {
      show: false,
      breadcrumbs: [homeCrumb]
    };

    if ( update.page === 'onboarding' || update.page === 'onboarding-new'){
      breadcrumbs.show = true;
      breadcrumbs.breadcrumbs.push({text: 'Onboarding', link: `/onboarding`});
      if ( update.page === 'onboarding-new' ) {
        breadcrumbs.breadcrumbs.push({text: 'New Request', link: `/onboarding/new`});
      }
    } else if ( update.page === 'separation' ){
      breadcrumbs.show = true;
      breadcrumbs.breadcrumbs.push({text: 'Separation', link: `/${update.page}`});
    }

    update.breadcrumbs = breadcrumbs;
  }
}
  
module.exports = new AppStateModelImpl();

