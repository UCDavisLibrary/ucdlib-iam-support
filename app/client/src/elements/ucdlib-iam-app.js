import { LitElement } from 'lit';
import {render} from "./ucdlib-iam-app.tpl.js";

// global event bus and model registry
import "@ucd-lib/cork-app-utils";
import "../models";

// global components
import "./components/ucdlib-iam-state";

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
    this.loadedPages = {};

    this.page = 'loading';
    this.showPageTitle = false;
    this.pageTitle = '';
    this.showBreadcrumbs = false;
    this.breadcrumbs = [];

    this._injectModel('AppStateModel');
  }
  

  /**
   * @description Disables the shadowdom
   * @returns 
   */
  createRenderRoot() {
    return this;
  }

  /**
   * @method _onAppStateUpdate
   * @description bound to AppStateModel app-state-update event
   *
   * @param {Object} e
   */
  async _onAppStateUpdate(e) {

    // dynamically load code
    if ( !this.loadedPages[this.page] ) {
      this.AppStateModel.showLoading(e.page);
      this.loadedPages[e.page] = this.loadPage(e.page);
    }
    await this.loadedPages[e.page];
    this.AppStateModel.showLoaded(e.page);

    // set page attributes
    this.showPageTitle = e.title.show;
    this.pageTitle = e.title.text;
    this.showBreadcrumbs = e.breadcrumbs.show;
    this.breadcrumbs = e.breadcrumbs.breadcrumbs;
    //this.page = e.page;
    window.scroll(0,0);
    console.log(e);
  }

  /**
   * @method _onAppStatusChange
   * @description Attached to AppStateModel app-status-change event
   * Controls showing loading/error page, which are not controlled by url location changes
   * @param {Object} status
   */
  _onAppStatusChange(status){
    console.log('status change', status);
    this.status = status.status;
    if ( status.page ) {
      this.page = status.page;
    } else {
      this.page = 'loading';
    }
    if (status.hasOwnProperty('errorMessage')) this.errorMessage = status.errorMessage;
  }

  /**
   * @description Shows the loading page
   */
  showLoadingPage() {
    this.page = 'loading';

  }

  /**
   * @method loadPage
   * @description code splitting done here.  dynamic import a page based on route
   *
   * @param {String} page page to load
   * 
   * @returns {Promise}
   */
  loadPage(page) {
    if( bundles.all.includes(page) ) {
      return import(/* webpackChunkName: "pages" */ "./pages/bundles/all");
    }
    console.warn('No code chunk loaded for this page');
    return false;
  }

}

customElements.define('ucdlib-iam-app', UcdlibIamApp);