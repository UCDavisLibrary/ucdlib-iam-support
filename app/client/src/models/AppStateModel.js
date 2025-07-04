import {AppStateModel} from '@ucd-lib/cork-app-state';
import AppStateStore from '../stores/AppStateStore';

/**
 * @description Model for handling generic app state, such as routing
 */
class AppStateModelImpl extends AppStateModel {

  constructor() {
    super();

    this.defaultPage = 'home';
    this.currentPage = this.defaultPage;
    this.store = AppStateStore;
  }

  /**
   * @description Sets the current route state
   * @param {Object} update - Route state - Returned in AppStateUpdate
   * @returns
   */
  set(update) {
    if ( update.location.path.length && update.location.path[0] == 'logout' ){
      this.logout();
    }

    const modals = document?.querySelectorAll?.('ucdlib-iam-modal');
    if ( modals && modals.length ) {
      modals.forEach(m => m.hide?.());
    }

    this.stripStateFromHash(update);
    this.setPage(update);
    this.setTitle(false, update);
    this.setBreadcrumbs(false, update);
    this.closeNav();

    let res = super.set(update);

    return res;
  }

  /**
   * @description Fire an app-state-update event for the current location
   */
  refresh(){
    const location = this.store.data;
    this.setTitle(false, location);
    this.setBreadcrumbs(false, location);
    this.store.emit(this.store.events.APP_STATE_UPDATE, location);
  }

  /**
   * @description Sets page data for route
   * @param {Object} update
   */
  setPage(update){
    let p;
    if(
      !update.location.path.length ||
      !update.location.path[0]
    ) {
      p = this.defaultPage;
    } else if(
      update.location.path[0] == 'onboarding' &&
      update.location.path.length > 1 &&
      update.location.path[1] == 'new'
    ) {
      p = 'onboarding-new';
    } else if(
      update.location.path[0] == 'separation' &&
      update.location.path.length > 1 &&
      update.location.path[1] == 'new'
    ) {
      p = 'separation-new';
    } else if(
      update.location.path[0] == 'onboarding' &&
      update.location.path.length > 1
    ) {
      p = 'onboarding-single';

    } else if(
      update.location.path[0] == 'separation' &&
      update.location.path.length > 1
    ) {
      p = 'separation-single';
    } else if(
      update.location.path[0] == 'permissions' &&
      update.location.path.length > 1
    ) {
      p = 'permissions-single';
    }else if(
      update.location.path[0] == 'orgchart' &&
      update.location.path.length > 1
    ) {
      p = 'orgchart';
    } else if(
      update.location.path[0] == 'patron' &&
      update.location.path.length > 1
    ) {
      p = 'patron';
    } else if(
      update.location.path[0] == 'emupdate' &&
      update.location.path.length > 1
    ) {
      p = 'emupdate';
    } else {
      p = update.location.path[0];
    }
    update.page = p;
    this.currentPage = p;

  }

  /**
   * @description Sets title of page
   * @param {Object} titleUpdate Manually set page title: {show: bool, text: str}
   * @param {Object} update From app-state-update
   */
  setTitle(titleUpdate, update){
    if ( titleUpdate ){
      this.store.emit('app-header-update', {title: titleUpdate});
      return;
    }
    const title = {
      show: false,
      text: ''
    };
    if ( update.page === 'onboarding' ){
      title.show = this.store.pageTitles.onboarding ? true : false;
      title.text = this.store.pageTitles.onboarding;
    } else if ( update.page === 'separation' ){
      title.show = this.store.pageTitles.separation ? true : false;
      title.text = this.store.pageTitles.separation;
    } else if ( update.page === 'onboarding-new' ){
      title.show = this.store.pageTitles.onboardingNew ? true : false;
      title.text = this.store.pageTitles.onboardingNew;
    } else if ( update.page === 'separation-new' ){
      title.show = this.store.pageTitles.separationNew ? true : false;
      title.text = this.store.pageTitles.separationNew;
    } else if ( update.page === 'permissions' ){
      title.show = this.store.pageTitles.permissions ? true : false;
      title.text = this.store.pageTitles.permissions;
    } else if ( update.page === 'orgchart' ){
      title.show = this.store.pageTitles.orgchart ? true : false;
      title.text = this.store.pageTitles.orgchart;
    } else if ( update.page === 'emupdate' ){
      title.show = this.store.pageTitles.emupdate ? true : false;
      title.text = this.store.pageTitles.emupdate;
    } else if ( update.page === 'patron' ){
      title.show = this.store.pageTitles.patronLookup ? true : false;
      title.text = this.store.pageTitles.patronLookup;
    } else if ( update.page === 'tools' ){
      title.show = this.store.pageTitles.tools ? true : false;
      title.text = this.store.pageTitles.tools;
    }


    this.store.emit('app-header-update', {title});
  }

  /**
   * @description Remove extraneous state values from hash set by keycloak.
   * It interferes with the app's routing.
   * @param {*} update
   * @returns
   */
  stripStateFromHash(update){
    if ( !update || !update.location || !update.location.hash ) return;
    let hash = new URLSearchParams(update.location.hash);
    const toStrip = ['state', 'session_state', 'code'];
    let replace = false;
    for (const key of toStrip) {
      if ( hash.has(key) ) {
        hash.delete(key);
        replace = true;
      }
    }
    if ( !replace ) return;
    hash = hash.toString().replace('=','');
    update.location.hash = hash;
  }

  /**
   * @description Sets breadcrumbs
   * @param {Object} breadcrumbUpdate Manually set breadcrumbs: {show: bool, breadcrumbs: [{text, link}]}
   * @param {Object} update From app-state-update
   */
  setBreadcrumbs(breadcrumbUpdate, update){
    if ( breadcrumbUpdate ) {
      this.store.emit('app-header-update', {breadcrumbs: breadcrumbUpdate});
      return;
    }
    const breadcrumbs = {
      show: false,
      breadcrumbs: [this.store.breadcrumbs.home]
    };

    if ( update.page === 'onboarding' || update.page === 'onboarding-new'){
      breadcrumbs.show = true;
      breadcrumbs.breadcrumbs.push(this.store.breadcrumbs.onboarding);
      if ( update.page === 'onboarding-new' ) {
        breadcrumbs.breadcrumbs.push(this.store.breadcrumbs.onboardingNew);
        if ( update.location.hash === 'lookup'){
          breadcrumbs.breadcrumbs.push(this.store.breadcrumbs.onboardingNewLookup);
        } else if ( update.location.hash === 'manual' ) {
          breadcrumbs.breadcrumbs.push(this.store.breadcrumbs.onboardingNewManual);
        } else if ( update.location.hash === 'submission' ) {
          breadcrumbs.breadcrumbs.push(this.store.breadcrumbs.onboardingNewSubmission);
        } else if ( update.location.hash === 'transfer' ) {
          breadcrumbs.breadcrumbs.push(this.store.breadcrumbs.onboardingTransfer);
        }
      }
    } else if ( update.page === 'separation' ){
      breadcrumbs.show = true;
      breadcrumbs.breadcrumbs.push(this.store.breadcrumbs.separation);
    }
    else if ( update.page === 'separation-new' ) {
      breadcrumbs.show = true;
      breadcrumbs.breadcrumbs.push(this.store.breadcrumbs.separation);
      breadcrumbs.breadcrumbs.push(this.store.breadcrumbs.separationNew);
      if ( update.location.hash === 'lookup' ) {
        breadcrumbs.breadcrumbs.push(this.store.breadcrumbs.separationNewLookup);
      } else if ( update.location.hash === 'submission' ) {
        breadcrumbs.breadcrumbs.push(this.store.breadcrumbs.onboardingNewSubmission);
      }
    }
    else if ( update.page === 'permissions' ){
      breadcrumbs.show = true;
      breadcrumbs.breadcrumbs.push(this.store.breadcrumbs.permissions);
    }
    else if ( update.page === 'orgchart' ){
      breadcrumbs.show = true;
      breadcrumbs.breadcrumbs.push(this.store.breadcrumbs.orgchart);
    }
    else if ( update.page === 'emupdate' ){
      breadcrumbs.show = true;
      breadcrumbs.breadcrumbs.push(this.store.breadcrumbs.emupdate);
    }
    else if ( update.page === 'patron' ){
      breadcrumbs.show = true;
      breadcrumbs.breadcrumbs.push(this.store.breadcrumbs.patronLookup);
    }
    else if ( update.page === 'tools' ){
      breadcrumbs.show = true;
      breadcrumbs.breadcrumbs.push(this.store.breadcrumbs.tools);
    }

    this.store.emit('app-header-update', {breadcrumbs});
  }

  /**
   * @description Show dismissable alert banner at top of page. Will disappear on next app-state-update event
   * @param {Object|String} options Alert message if string, config if object:
   * {message: 'alert!'
   * brandColor: 'double-decker'
   * }
   */
  showAlertBanner(options){
    if ( typeof options === 'string' ){
      options = {message: options};
    }
    this.store.emit('alert-banner-update', options);
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

  /**
   * @description Close the app's primary nav menu
   */
  closeNav(){
    const ele = document.querySelector('ucd-theme-header');
    if ( ele ) {
      ele.close();
    }
  }

}

const model = new AppStateModelImpl();
export default model;

