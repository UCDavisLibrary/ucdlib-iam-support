import {AppStateModel} from '@ucd-lib/cork-app-state';
import AppStateStore from '../stores/AppStateStore';
import Keycloak from 'keycloak-js';

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
  async set(update) {
    if ( !window.Keycloak ){
      await this.initKeycloak();
    }
    if ( update.location.path.length && update.location.path[0] == 'logout' ){
      this.logout();
    }
    
    this.setPage(update);
    this.setTitle(false, update);
    this.setBreadcrumbs(false, update);
    
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
    }

    this.store.emit('app-header-update', {title});
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
        }
      }
    } else if ( update.page === 'separation' ){
      breadcrumbs.show = true;
      breadcrumbs.breadcrumbs.push(this.store.breadcrumbs.separation);
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
   * @description Initialize auth
   */
  async initKeycloak(){
    window.Keycloak = new Keycloak({...window.APP_CONFIG.keycloak, checkLoginIframe: true});
    const kc = window.Keycloak;

    // cant get this to work as i would expect it to.
    //kc.onAuthLogout = () => {this._onAuthLogout();};
    
    kc.onAuthRefreshError = () => {this._onAuthRefreshError();};
    await kc.init({
      onLoad: 'check-sso',
      silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
    });
    if ( !kc.authenticated) {
      await kc.login();
      this.store.userProfile = await kc.loadUserProfile();
    }

    // log out user if their session expires
    // i thought onAuthLogout cb would do this automatically
    // but maybe this wont work, since it resets the idle clock
    setInterval(async () => {
      try {
        await window.Keycloak.updateToken();
        this.store.userProfile = await window.Keycloak.loadUserProfile();
      } catch (error) {
        this.logout();
      }
    }, 10 * 60 * 1000);
  }

  /**
   * @description Logs user out of application
   */
  logout(){
    const redirectUri = window.location.origin + '/logged-out.html';
    if ( window.Keycloak && window.Keycloak.authenticated ){
      window.Keycloak.logout({redirectUri});
    } else {
      window.location = redirectUri;
    }
  }

  /**
   * @description Logs user out if access token fails to refresh (their session expired)
   */
  _onAuthRefreshError(){
    this.logout();
  }
}

const model = new AppStateModelImpl();
export default model;

