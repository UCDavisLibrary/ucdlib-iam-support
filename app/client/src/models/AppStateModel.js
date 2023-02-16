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
    } else if(
      update.location.path[0] == 'onboarding' &&
      update.location.path.length > 1
    ) {
      update.page = 'onboarding-single';
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

        if ( update.location.hash === 'lookup'){
          breadcrumbs.breadcrumbs.push({text: 'Lookup Employee', link: `/onboarding/new#lookup`});
        } else if ( update.location.hash === 'manual' ) {
          breadcrumbs.breadcrumbs.push({text: 'Manual Entry', link: `/onboarding/new#manual`});
        } else if ( update.location.hash === 'submission' ) {
          breadcrumbs.breadcrumbs.push({text: 'Submission', link: `/onboarding/new#submission`});
        }
      }
    } else if ( update.page === 'separation' ){
      breadcrumbs.show = true;
      breadcrumbs.breadcrumbs.push({text: 'Separation', link: `/${update.page}`});
    }

    update.breadcrumbs = breadcrumbs;
  }

  /**
   * @description Show the app's loading page
   * @param {String} returnPage The page to set when loading is complete and showLoaded method is called
   */
  showLoading(returnPage){
    if ( returnPage ) {
      this.store.lastPage = returnPage;
    }
    this.store.emit('app-status-change', {status: 'loading'});
  }

  /**
   * @description Show the app's error page
   * @param {String} msg Error message to show
   */
  showError(msg=''){
    this.store.emit('app-status-change', {status: 'error', errorMessage: msg});
  }

  /**
   * @description Return app to a non-error/non-loading status
   * @param {String} page - Optional. The page to show.
   */
  showLoaded(page){
    page = page || this.store.lastPage;
    this.store.emit('app-status-change', {status: 'loaded', page});
  }
}
  
module.exports = new AppStateModelImpl();

