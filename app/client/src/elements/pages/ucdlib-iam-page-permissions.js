import { LitElement } from 'lit';
import * as Templates from "./ucdlib-iam-page-permissions.tpl.js";
import { LitCorkUtils, Mixin } from '@ucd-lib/cork-app-utils';

/**
 * @classdesc Page that displays options for requesting permissions
 * Allows user to pick if is for
 * - themselves
 * - one of their employees
 * - Any UC Davis employee
 *
 * And then can pick specific applications to update
 */
export default class UcdlibIamPagePermissions extends Mixin(LitElement)
  .with(LitCorkUtils) {

  static get properties() {
    return {
      page: {type: String},
      permissionsFor: {type: String},
      reports: {type: Array},
      selectedReport: {type: String},
      selectedEmployee: {type: String},
      selectedApplications: {type: Array},
      userPermissionRequests: {type: Array}
    };
  }

  constructor() {
    super();
    this.render = Templates.render.bind(this);
    this.renderHome = Templates.renderHome.bind(this);
    this.renderReportSelect = Templates.renderReportSelect.bind(this);
    this.renderApplicationsSelect = Templates.renderApplicationsSelect.bind(this);
    this.renderEmployeeSelect = Templates.renderEmployeeSelect.bind(this);

    this.resetState();
    this.reports = [];
    this.userPermissionRequests = [];

    this._injectModel('AppStateModel', 'EmployeeModel', 'PermissionsModel');
  }

  /**
   * @description Disables the shadowdom
   * @returns
   */
  createRenderRoot() {
    return this;
  }

  /**
   * @description Reset element state properties to defaults
   */
  resetState(){
    this.permissionsFor = 'self';
    this.page = 'home';
    this.selectedReport = '';
    this.selectedEmployee = '';
    this.selectedApplications = [];
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

    // set page from hash
    const hashes = ['report', 'applications', 'employee'];
    const hash = new URLSearchParams(e.location.hash);
    const recognizedHashes = hashes.map(h => hash.has(h) ? h : null).filter(h => h);
    if ( recognizedHashes.length ){
      this.page = recognizedHashes[0];
    } else {
      this.resetState();
    }

    // get any needed data
    const promises = [];
    if ( this.page == 'report' ){
      promises.push(this.EmployeeModel.getDirectReports());
    } else if ( this.page == 'home' ){
      promises.push(this.PermissionsModel.ownUpdateList());
    }
    await Promise.all(promises);


    this.setBreadcrumbs();
    this.AppStateModel.showLoaded(this.id);
  }

  _onPermissionsOwnUpdateListFetch(e){
    if ( e.state === 'loaded' ){
      this.userPermissionRequests = e.payload;
    } else if ( e.state === 'error' ){
      this.AppStateModel.showError('Error fetching your permission requests');
    }
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
    } else if ( this.page == 'applications' ){
      breadcrumbs.push(this.AppStateModel.store.breadcrumbs.permissionsApplications);
    } else if ( this.page == 'employee' ){
      breadcrumbs.push(this.AppStateModel.store.breadcrumbs.permissionsEmployee);
    }

    this.AppStateModel.setBreadcrumbs({show: true, breadcrumbs});
  }

  /**
   * @description Bound to EmployeeModel direct-reports-fetched event
   * @param {Object} e - cork-app-utils update event
   */
  _onDirectReportsFetched(e){
    if ( e.state === 'loaded' ){
      this.reports = e.payload;
    } else if ( e.state === 'error' ){
      this.AppStateModel.showError('Error fetching direct reports');
    }
  }

  /**
   * @description Attached to direct report select form
   * @param {*} e
   */
  _onReportsFormSubmit(e){
    e.preventDefault();
    this.permissionsFor = 'report';
    this.AppStateModel.setLocation('#applications');
  }

  /**
   * @description Called after last step of the disambiguation request is completed
   * Forwards onto the actual permissions form.
   * @param {*} e
   */
  _onSubmit(e){
    e.preventDefault();
    const params = new URLSearchParams();
    if ( this.permissionsFor == 'report' ){
      params.set('user', this.selectedReport);
    } else if ( this.permissionsFor == 'employee' ){
      params.set('user', this.selectedEmployee);
    }
    if ( this.selectedApplications.length ){
      params.set('applications', this.selectedApplications.join(','));
    }

    const urlParams = params.toString();
    this.AppStateModel.setLocation('/permissions/update' + (urlParams ? '?' + urlParams : ''));
  }
  /**
   * @description Bound to ucdlib-iam-search element in employee select form
   * @param {*} response
   */
  _onEmployeeSelect(response){
    if ( response.state === 'loaded' ){
      this.permissionsFor = 'employee';
      this.selectedEmployee = response.id;
      this.AppStateModel.setLocation('#applications');
    } else if ( response.state === 'error' ){
      this.AppStateModel.showError('Error fetching employee');
    }
  }
}

customElements.define('ucdlib-iam-page-permissions', UcdlibIamPagePermissions);
