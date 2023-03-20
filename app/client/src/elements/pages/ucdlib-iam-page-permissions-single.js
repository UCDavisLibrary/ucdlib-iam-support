import { LitElement } from 'lit';
import * as Templates from "./ucdlib-iam-page-permissions-single.tpl.js";

import DtUtils from "@ucd-lib/iam-support-lib/src/utils/dtUtils.js";

import "../components/ucdlib-iam-modal";

/**
 * @classdesc Page for displaying a single permissions request form
 */
export default class UcdlibIamPagePermissionsSingle extends window.Mixin(LitElement)
  .with(window.LitCorkUtils) {

  static get properties() {
    return {
      formType: {state: true},
      record: {state: true},
      associatedObjectId: {state: true},
      associatedObject: {state: true},
      isActive: {state: true},
      submitting: {state: true},
      isAnEdit: {state: true},
      firstName: {state: true},
      lastName: {state: true},
      iamId: {state: true},
      rtTicketId: {state: true},
      submitted: {state: true},
      submittedBy: {state: true},
      helpModal: {state: true},
      notes: {state: true},
      pMainWebsiteRoles: {state: true},
      pMainWebsiteNotes: {state: true}
    };
  }

  constructor() {
    super();
    this.render = Templates.render.bind(this);
    this.renderHelpModal = Templates.renderHelpModal.bind(this);

    this.formTypes = {
      'onboarding': {title: 'Permissions for :name'}
    };
    this.formType = 'onboarding';
    this.associatedObjectId = 0;
    this.associatedObject = {};
    this.record = {};
    this.rtTicketId = '';
    this.iamId = '';
    this.submitted = '';
    this.submittedBy = '';
    this.isActive = false;
    this.isAnEdit = false;
    this.helpModal = '';
    this.submitting = false;

    this.firstName = '';
    this.lastName = '';

    // permissions
    this.pMainWebsiteRolesList = [
      {
        slug: 'subscriber', 
        label: 'Subscriber',
        description: 'User can log in, but has no real capabilities.'
      },
      {
        slug: 'author', 
        label: 'Author',
        description: `The default role. User can create pages, exhibits, and news posts, but cannot edit other's pages/posts`
      },
      {
        slug: 'editor', 
        label: 'Editor',
        description: 'User can create and edit all pages, exhibits, and news posts on the site.'
      },
      {
        slug: 'directory_manager', 
        label: 'Directory Manager',
        description: 'Can create and edit person profiles, and update staff directory display settings.'
      },
      {
        slug: 'exhibit_manager', 
        label: 'Exhibit Manager',
        description: 'Can manage exhibit terms (locations, curating orgs, etc).'
      },
      {
        slug: 'collection_manager', 
        label: 'Special Collection Manager',
        description: 'Can create and edit manuscripts/univeristy archives entries.'
      }
    ];
    this.setDefaultForm();

    this._injectModel('AppStateModel', 'OnboardingModel', 'PermissionsModel', 'RtModel');
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
      promises.push(this.PermissionsModel.getById(this.associatedObjectId, 'onboarding'));
    }
    await Promise.all(promises);
  }

  /**
   * @description Attached to PermissionsModel PERMISSIONS_RECORD_REQUEST
   * Fires when permissions record is retrieved, even if cached
   * @param {*} e - cork-app-utils event
   */
  _onPermissionsRecordRequest(e){
    if ( !this.isActive ) return;
    if ( e.state === 'loaded' ){
      const p = e.payload;
      this.record = p;
      this.isAnEdit = true;
      this.submitted = DtUtils.fmtDatetime(p.submitted);
      this.submittedBy = p.submittedBy;
      this.notes = p.notes || '';
      if ( p.permissions.mainWebsite ){
        this.pMainWebsiteRoles = p.permissions.mainWebsite.roles || [];
        this.pMainWebsiteNotes = p.permissions.mainWebsite.notes || '';
      }
    }
    else if (e.state === 'error' ){
      if ( e.error && e.error.response && e.error.response.status == 404){
        this.isAnEdit = false;
      } else {
        let msg = 'Unable to retrieve permissions request';
        if ( e.error && e.error.payload && e.error.payload.message ) msg = e.error.payload.message;
        setTimeout(() => {
          this.AppStateModel.showError(msg);
        }, 10);
      }
    }
    console.log(e);
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
      this.rtTicketId = e.payload.rtTicketId || '';
      this.iamId = e.payload.iamId || '';
      const title = this.formTypes[this.formType].title.replace(':name', `${this.firstName} ${this.lastName}`);
      this.AppStateModel.setTitle({text: title, show: true});
      this.setBreadcrumbs();
    } else if (e.state === 'error' ){
      let msg = 'Unable to retrieve onboarding request';
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
  setDefaultForm(){
    this.pMainWebsiteRoles = [];
    this.pMainWebsiteNotes = '';
    this.notes = '';
  }

  /**
   * @description Show help modal
   * @param {String} modalType - Slug for content that should be displayed
   */
  showHelpModal(modalType){
    if ( modalType ) {
      this.helpModal = modalType;
      const ele = this.renderRoot.querySelector('#perm-help-modal');
      if ( ele ) ele.show();
    }
  }

  /**
   * @description Attached to submit event on main form
   * @param {*} e - Submit event
   */
  _onSubmit(e){
    e.preventDefault();
    if ( this.submitting ) return;
    this.PermissionsModel.newSubmission(this.payload());
  }

  /**
   * @description Attached PermissionsModel PERMISSIONS_SUBMISSION event
   * @param {Object} e - cork-app-utils event
   */
  _onPermissionsSubmission(e){
    if ( e.state == 'loading' ){
      this.submitting = true;
      this.AppStateModel.showLoading();
    } else if ( e.state == 'loaded' ){
      this.submitting = false;
      if ( this.formType === 'onboarding' ){
        this.OnboardingModel.clearIdCache(this.associatedObjectId);
        this.PermissionsModel.clearIdCache(this.associatedObjectId, 'onboarding');
        if ( this.rtTicketId ) this.RtModel.clearHistoryCache(this.rtTicketId);
        this.AppStateModel.setLocation(`/onboarding/${this.associatedObjectId}`);
      }
      this.AppStateModel.showAlertBanner({message: 'Permissions request submitted', brandColor: 'farmers-market'});
      this.setDefaultForm();

    } else if ( e.state == 'error' ){
      this.submitting = false;
      console.error(e);
      let msg = '';
      if ( e.error.details && e.error.details.message ){
        msg =  e.error.details.message;
      }
      this.AppStateModel.showError(msg);
    }
  }

  /**
   * @description Construct payload for submission POST
   * @returns {Object} payload
   */
  payload(){
    const payload = {};
    const permissions = {};
    payload.action = this.formType;
    if ( this.formType === 'onboarding' && this.associatedObjectId ){
      payload.onboardingRequestId = this.associatedObjectId;
    }
    if ( this.iamId ){
      payload.iamId = this.iamId;
    }
    if ( this.notes ){
      payload.notes = this.notes;
    }
    permissions.mainWebsite = {
      roles: this.pMainWebsiteRoles,
      notes: this.pMainWebsiteNotes
    };

    payload.permissions = permissions;
    return payload;
  }

}

customElements.define('ucdlib-iam-page-permissions-single', UcdlibIamPagePermissionsSingle);