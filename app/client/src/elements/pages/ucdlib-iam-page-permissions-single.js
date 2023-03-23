import { LitElement } from 'lit';
import * as Templates from "./ucdlib-iam-page-permissions-single.tpl.js";

import DtUtils from "@ucd-lib/iam-support-lib/src/utils/dtUtils.js";
import selectOptions from "../../utils/permissionsFormOptions.js";
import formProperties from '../../utils/permissionsFormProperties.js';

import "../components/ucdlib-iam-modal";

/**
 * @classdesc Page for displaying a single permissions request form
 */
export default class UcdlibIamPagePermissionsSingle extends window.Mixin(LitElement)
  .with(window.LitCorkUtils) {

  static get properties() {
    const elementState = {
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
    };
    const formState = {};
    for (const prop of formProperties) {
      formState[prop.prop] = {state: true};
    }
    return {
      ...elementState,
      ...formState
    };
  }

  constructor() {
    super();
    this.render = Templates.render.bind(this);
    this.renderHelpModal = Templates.renderHelpModal.bind(this);
    this.renderCheckbox = Templates.renderCheckbox.bind(this);
    this.renderTextArea = Templates.renderTextArea.bind(this);
    this.renderGroupLabel = Templates.renderGroupLabel.bind(this);

    this.formTypes = {
      'onboarding': {title: 'Permissions for :name'}
    };
    this.resetState();

    for (const option of selectOptions ) {
      this[option.k] = option.v;
    }

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
      this.setDefaultForm();
      const p = e.payload;
      this.record = p;
      this.payload = p;
      this.isAnEdit = true;
      this.submitted = DtUtils.fmtDatetime(p.submitted);
      this.submittedBy = p.submittedBy;
      this._setPayloadOrElement('element');
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
   * @description Resets page to default state
   */
  resetState(){
    this.formType = 'onboarding';
    this.associatedObjectId = 0;
    this.associatedObject = {};
    this.payload = {};
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
  }

  /**
   * @description Resets form to default state
   */
  setDefaultForm(){
    formProperties.forEach(p => {
      this[p.prop] = p.default;
    });
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
    this._setPayloadOrElement('payload');
    this.PermissionsModel.newSubmission(this.payload);
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
        this.OnboardingModel.clearQueryCache();
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
  setPayload(){
    this.payload = {};
    this.payload.action = this.formType;
    if ( this.formType === 'onboarding' && this.associatedObjectId ){
      this.payload.onboardingRequestId = this.associatedObjectId;
    }
    this._setPayloadOrElement('payload');
  }

  /**
   * @description Sets payload properties based on element properties or vice versa
   * @param {String} toSet - 'payload' or 'element'
   * @returns 
   */
  _setPayloadOrElement(toSet){
    if ( !toSet ) return;

    formProperties.forEach((item) => {
      if ( toSet === 'payload' ){
        const payloadArr = item.payload.split('.');
        payloadArr.forEach((prop, i) => {
          const payloadPath = payloadArr.slice(0, i+1).join('.');
          const isLast = i === payloadArr.length - 1;
          if ( isLast ){
            eval(`this.payload.${payloadPath} = this.${item.prop}`);
          } else if ( typeof eval(`this.payload.${payloadPath}`) === 'undefined' ){
            eval(`this.payload.${payloadPath} = {}`);
          } 
        });
      } else if ( toSet === 'element' ){
        try {
          const v = eval(`this.payload.${item.payload}`);
          if ( typeof v !== 'undefined' ){
            this[item.prop] = v;
          }
        } catch (error) {}
      }
    });
  }

}

customElements.define('ucdlib-iam-page-permissions-single', UcdlibIamPagePermissionsSingle);