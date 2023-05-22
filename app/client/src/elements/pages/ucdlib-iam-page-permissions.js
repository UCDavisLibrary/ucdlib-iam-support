import { LitElement } from 'lit';
import * as Templates from "./ucdlib-iam-page-permissions.tpl.js";

/**
 * @classdesc TODO: Page that displays options for requesting permissions
 * Allows user to pick if is for
 * - themselves
 * - one of their employees
 * - someone else (does not have to be employee list)
 *
 * And then can pick specific permissions wants to update
 */
export default class UcdlibIamPagePermissions extends window.Mixin(LitElement)
  .with(window.LitCorkUtils) {

  static get properties() {
    return {
      page: {type: String},
      permissionsFor: {type: String},
      reports: {type: Array},
    };
  }

  constructor() {
    super();
    this.render = Templates.render.bind(this);
    this.renderHome = Templates.renderHome.bind(this);
    this.renderReportSelect = Templates.renderReportSelect.bind(this);

    this.permissionsFor = 'self';
    this.page = 'home';
    this.reports = [];

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
    if ( e.page != this.id ) return;
    this.AppStateModel.showLoading(this.id);
    const hashes = ['report'];
    const promises = [];
    console.log(e);
    if ( e.location.hash && hashes.includes(e.location.hash)){
      this.page = e.location.hash;
    } else {
      this.permissionsFor = 'self';
      this.page = 'home';
    }
    await Promise.all(promises);
    this.setBreadcrumbs();
    this.AppStateModel.showLoaded(this.id);
  }

  /**
   * @description Sets breadcrumbs for this page
   */
  setBreadcrumbs(){
    const breadcrumbs = [
      this.AppStateModel.store.breadcrumbs.home,
      this.AppStateModel.store.breadcrumbs.permissions
    ];
    if ( this.page == 'report' ){
      breadcrumbs.push(this.AppStateModel.store.breadcrumbs.permissionsReport);
    }

    this.AppStateModel.setBreadcrumbs({show: true, breadcrumbs});
  }

}

customElements.define('ucdlib-iam-page-permissions', UcdlibIamPagePermissions);
