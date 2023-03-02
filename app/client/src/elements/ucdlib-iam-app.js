import { LitElement } from 'lit';
import {render} from "./ucdlib-iam-app.tpl.js";

// auth
import Keycloak from 'keycloak-js';

// global event bus and model registry
import "@ucd-lib/cork-app-utils";
import "../models";

// global components
import "./components/ucdlib-iam-state";
import "./components/ucdlib-iam-alert";

// pages
import bundles from "./pages/bundles";

/**
 * @description The main custom element
 * Handles application-level stuff, such as routing.
 */
export default class UcdlibIamApp extends window.Mixin(LitElement)
  .with(window.LitCorkUtils) {

  static get properties() {
    return {
      page: {type: String},
      showPageTitle: {type: Boolean},
      pageTitle: {type: String},
      showBreadcrumbs: {type: Boolean},
      breadcrumbs: {type: Array},
      status: {type: String},
      errorMessage: {type: String, attribute: 'error-message'}
    };
  }

  constructor() {
    super();
    this.render = render.bind(this);
    this.loadedBundles = {};

    this.page = 'loading';
    this.showPageTitle = false;
    this.pageTitle = '';
    this.showBreadcrumbs = false;
    this.breadcrumbs = [];

    this._injectModel('AppStateModel');
    this.AppStateModel.initKeycloak();
    this.AppStateModel.refresh();
  }
  

  /**
   * @description Disables the shadowdom
   * @returns 
   */
  createRenderRoot() {
    return this;
  }

  /**
   * @description Custom element lifecyle event
   */
  connectedCallback(){
    super.connectedCallback();
    this.style.display = 'block';
    document.querySelector('#whole-screen-load').style.display = 'none';
  }

  /**
   * @method _onAppStateUpdate
   * @description bound to AppStateModel app-state-update event
   *
   * @param {Object} e
   */
  async _onAppStateUpdate(e) {

    const bundle = this._getBundleName(e.page);
    let bundleAlreadyLoaded = true;

    // dynamically load code
    if ( !this.loadedBundles[bundle] ) {
      bundleAlreadyLoaded = false;
      this.AppStateModel.showLoading(e.page);
      this.loadedBundles[bundle] = this.loadBundle(bundle);

    }
    await this.loadedBundles[bundle];
    this.AppStateModel.showLoaded(e.page);

    // requested page element might be listening to app-state-update event
    // so need to fire again
    if ( !bundleAlreadyLoaded ){
      this.AppStateModel.store.emit('app-state-update', e);
    } 

    //this.page = e.page;
    window.scroll(0,0);
  }

  /**
   * @description bound to AppStateModel app-header-update event
   * @param {Object} e 
   */
  _onAppHeaderUpdate(e){
    if ( e.breadcrumbs ) {
      this.showBreadcrumbs = e.breadcrumbs.show;
      this.breadcrumbs = e.breadcrumbs.breadcrumbs;
    }
    if ( e.title ){
      this.showPageTitle = e.title.show;
      this.pageTitle = e.title.text;
    }
  }

  /**
   * @method _onAppStatusChange
   * @description Attached to AppStateModel app-status-change event
   * Controls showing loading/error page, which are not controlled by url location changes
   * @param {Object} status
   */
  _onAppStatusChange(status){
    this.status = status.status;
    if ( status.page ) {
      this.page = status.page;
    } else {
      this.page = 'loading';
    }
    if (Object.prototype.hasOwnProperty.call(status, 'errorMessage')) this.errorMessage = status.errorMessage;
  }

  /**
   * @description Shows the loading page
   */
  showLoadingPage() {
    this.page = 'loading';

  }

  /**
   * @description code splitting done here
   *
   * @param {String} bundle bundle to load
   * 
   * @returns {Promise}
   */
  loadBundle(bundle) {
    
    if( bundle == 'all' ) {
      return import(/* webpackChunkName: "pages" */ "./pages/bundles/all");
    }
    console.warn('No code chunk loaded for this page');
    return false;
  }

  /**
   * @description Get name of bundle a page element is in
   * @param {*} page 
   * @returns {String}
   */
  _getBundleName(page){
    for (const bundle in bundles) {
      if ( bundles[bundle].includes(page) ){
        return bundle;
      }
    }
    return '';
  }

}

(async () => {
  // instantiate keycloak instance
  window.keycloak = new Keycloak({...window.APP_CONFIG.keycloak, checkLoginIframe: true});
  const kc = window.keycloak;
  const logoutUrl = window.location.origin + '/logged-out.html';
  const silentCheckSsoRedirectUri = window.location.origin + '/silent-check-sso.html';

  // set up listeners to load app upon auth success
  kc.onAuthRefreshError = () => {window.location = logoutUrl;};
  kc.onAuthSuccess = () => {customElements.define('ucdlib-iam-app', UcdlibIamApp);};

  // initialize auth
  await kc.init({
    onLoad: 'check-sso',
    silentCheckSsoRedirectUri
  });
  if ( !kc.authenticated) {
    await kc.login();
  }

})();
