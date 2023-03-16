import { LitElement } from 'lit';
import {render} from "./ucdlib-iam-page-permissions-single.tpl.js";

/**
 * @classdesc Page for displaying a single permissions request form
 */
export default class UcdlibIamPagePermissionsSingle extends window.Mixin(LitElement)
  .with(window.LitCorkUtils) {

  static get properties() {
    return {
      formType: {state: true},
      associatedObjectId: {state: true},
      associatedObject: {state: true},
      isActive: {state: true},
      isAnEdit: {state: true},
      firstName: {state: true},
      lastName: {state: true},
      pMainWebsiteRoles: {state: true}
    };
  }

  constructor() {
    super();
    this.render = render.bind(this);

    this.formTypes = {
      'onboarding': {title: 'Permissions for :name'}
    };
    this.formType = 'onboarding';
    this.associatedObjectId = 0;
    this.associatedObject = {};
    this.isActive = false;
    this.isAnEdit = false;

    this.firstName = '';
    this.lastName = '';

    // permissions
    this.pMainWebsiteRolesList = [
      {slug: 'subscriber', label: 'Subscriber'},
      {slug: 'author', label: 'Author'},
      {slug: 'editor', label: 'Editor'},
      {slug: 'student_employee', label: 'Student Employee'},
      {slug: 'directory_manager', label: 'Directory Manager'},
      {slug: 'exhibit_manager', label: 'Exhibit Manager'},
      {slug: 'collection_manager', label: 'Special Collection Manager'}
    ];
    this.setDefaultPermissions();

    this._injectModel('AppStateModel', 'OnboardingModel');
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
    this.isActive = false;
    if ( e.page != this.id ) return;

    if ( !Object.keys(this.formTypes).includes(e.location.path[1]) ){
      requestAnimationFrame(() => this.AppStateModel.showError('This page does not exist!'));
      return;
    }

    this.isActive = true;
    this.formType = e.location.path[1];
    this.associatedObjectId = e.location.path[2];
    await this.getRequiredPageData();
    this.AppStateModel.showLoaded(this.id);
  }

  /**
   * @description Do data retrieval required to display this page
   */
  async getRequiredPageData(){
    const promises = [];
    if ( this.formType == 'onboarding' ){
      promises.push(this.OnboardingModel.getById(this.associatedObjectId));
    }
    await Promise.all(promises);
  }

  /**
   * @description Attached to OnboardingModel ONBOARDING_SUBMISSION_REQUEST event.
   * Fires when onboarding request is retrieved, even if cached
   * @param {*} e - cork-app-utils event
   * @returns 
   */
  _onOnboardingSubmissionRequest(e){
    if ( !this.isActive ) return;
    if ( e.state === 'loaded' ){
      this.associatedObject = e.payload;
      this.firstName = e.payload.additionalData.employeeFirstName || '';
      this.lastName = e.payload.additionalData.employeeLastName || '';
      this.rtTicketId = e.payload.rtTicketId;
      const title = this.formTypes[this.formType].title.replace(':name', `${this.firstName} ${this.lastName}`);
      this.AppStateModel.setTitle({text: title, show: true});
      this.setBreadcrumbs();
    } else if (e.state === 'error' ){
      let msg = 'Unable to display onboarding request';
      if ( e.error && e.error.payload && e.error.payload.message ) msg = e.error.payload.message;
      setTimeout(() => {
        this.AppStateModel.showError(msg);
      }, 10);
    }
  }

  /**
   * @description Sets breadcrumbs for this page
   */
  setBreadcrumbs(){
    const breadcrumbs = [this.AppStateModel.store.breadcrumbs.home];
    if ( this.formType == 'onboarding' ){
      breadcrumbs.push(this.AppStateModel.store.breadcrumbs.onboarding);
      breadcrumbs.push({text: 'Request', link: `/onboarding/${this.associatedObjectId}`});
      breadcrumbs.push({text: 'Permissions', link: ''});
    }

    this.AppStateModel.setBreadcrumbs({show: true, breadcrumbs});
  }

  /**
   * @description Resets form to default state
   */
  setDefaultPermissions(){
    this.pMainWebsiteRoles = ['author'];
  }

  /**
   * @description Attached to submit event on main form
   * @param {*} e - Submit event
   */
  _onSubmit(e){
    e.preventDefault();
    console.log('submit!');
  }

}

customElements.define('ucdlib-iam-page-permissions-single', UcdlibIamPagePermissionsSingle);