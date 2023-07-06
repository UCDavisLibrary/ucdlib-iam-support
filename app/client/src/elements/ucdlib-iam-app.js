import { LitElement } from 'lit';
import {render} from "./ucdlib-iam-app.tpl.js";

// brand components
import '@ucd-lib/theme-elements/brand/ucd-theme-primary-nav/ucd-theme-primary-nav.js';
import '@ucd-lib/theme-elements/ucdlib/ucdlib-branding-bar/ucdlib-branding-bar.js';
import '@ucd-lib/theme-elements/brand/ucd-theme-header/ucd-theme-header.js';
import '@ucd-lib/theme-elements/ucdlib/ucdlib-pages/ucdlib-pages.js';
import '@ucd-lib/theme-elements/brand/ucd-theme-slim-select/ucd-theme-slim-select.js';

// import font awesome
import '@fortawesome/fontawesome-free/js/all.js';


// app config
import AppConfig from "@ucd-lib/iam-support-lib/src/config";

// auth
import Keycloak from 'keycloak-js';

// global event bus and model registry
import "@ucd-lib/cork-app-utils";
import {AuthModel} from "../models";

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

    // requested page element might be listening app events
    // so need to fire certain ones again
    if ( !bundleAlreadyLoaded ){
      this.AppStateModel.store.emit('app-state-update', e);
      AuthModel._onAuthRefreshSuccess();
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
  AppConfig.keycloakClient = new Keycloak({...AppConfig.keycloak, checkLoginIframe: true});
  const kc = AppConfig.keycloakClient;
  const silentCheckSsoRedirectUri = window.location.origin + '/silent-check-sso.html';

  // set up listeners keycloak listeners
  kc.onAuthRefreshError = () => {AuthModel.logout();};
  kc.onAuthError = () => {AuthModel.redirectUnauthorized();};
  kc.onAuthSuccess = () => {
    customElements.define('ucdlib-iam-app', UcdlibIamApp);
    AuthModel.init();
    AuthModel._onAuthRefreshSuccess();
  };
  kc.onAuthRefreshSuccess = () => {AuthModel._onAuthRefreshSuccess();};

  // initialize auth
  await kc.init({
    onLoad: 'check-sso',
    silentCheckSsoRedirectUri,
    scope: 'profile roles ucd-ids'
  });
  if ( !kc.authenticated) {
    await kc.login();
  }

})();
