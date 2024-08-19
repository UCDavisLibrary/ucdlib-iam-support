import { LitElement } from 'lit';
import {render} from "./ucdlib-iam-page-onboarding-single.tpl.js";
import dtUtls from '@ucd-lib/iam-support-lib/src/utils/dtUtils.js';
import IamPersonTransform from "@ucd-lib/iam-support-lib/src/utils/IamPersonTransform";
import { LitCorkUtils, Mixin } from '@ucd-lib/cork-app-utils';

import "../components/ucdlib-rt-history";
import "../components/ucdlib-iam-search";
import "../components/ucdlib-iam-modal";

/**
 * @description Page element for displaying a single onboarding request
 */
export default class UcdlibIamPageOnboardingSingle extends Mixin(LitElement)
  .with(LitCorkUtils) {

  static get properties() {
    return {
      requestId: {state: true},
      request: {state: true},
      firstName: {state: true},
      lastName: {state: true},
      isActiveStatus: {state: true},
      status: {state: true},
      statusDescription: {state: true},
      previousPosition: {state: true},
      isTransfer: {state: true},
      libraryTitle: {state: true},
      department: {state: true},
      startDate: {state: true},
      supervisorName: {state: true},
      supervisorId: {state: true},
      notes: {state: true},
      missingUid: {state: true},
      reconId: {state: true},
      facilitiesRtTicketId: {state: true},
      backgroundCheck: {state: true},
      hideBackgroundCheckButton: {state: true},
      sentBackgroundCheck: {state: true},
      rtTicketId: {state: true},
      ucdIamRecord: {state: true},
      supervisorEmail: {state: true}
    };
  }

  constructor() {
    super();
    this.render = render.bind(this);
    this.requestId = '';
    this.request = {};
    this.previousPosition = {};
    this.isTransfer = false;
    this.firstName = '';
    this.lastName = '';
    this.isActiveStatus = false;
    this.rtTicketId = '';
    this.status = '';
    this.libraryTitle = '';
    this.department = '';
    this.startDate = '';
    this.supervisorId = '';
    this.supervisorName = '';
    this.supervisorEmail = '';
    this.notes = '';
    this.statusDescription = '';
    this.missingUid = false;
    this.reconId = '';
    this.facilitiesRtTicketId = '';
    this.backgroundCheck = {};
    this.hideBackgroundCheckButton = false;
    this.sentBackgroundCheck = false;
    this.ucdIamRecord = new IamPersonTransform({});

    this._injectModel('AppStateModel', 'OnboardingModel', 'RtModel');
  }

  /**
   * @description Disables the shadowdom
   * @returns
   */
  createRenderRoot() {
    return this;
  }

  /**
   * @description Lit lifecycle called when element will update
   * @param {Map} props - changed properties
   */
  willUpdate(props) {
    if ( props.has('previousPosition') ) {
      this.isTransfer = Object.keys(this.previousPosition).length > 0;
    }
    if ( props.has('rtTicketId') || props.has('facilitiesRtTicketId') ) {
      this.hideBackgroundCheckButton = !this.rtTicketId && !this.facilitiesRtTicketId;
    }
    if ( props.has('backgroundCheck') ) {
      this.sentBackgroundCheck = this.backgroundCheck?.notificationSent || false;
    }
  }

  /**
   * @method _onAppStateUpdate
   * @description bound to AppStateModel app-state-update event
   *
   * @param {Object} e
   */
  async _onAppStateUpdate(e) {
    if ( e.page != this.id ) return;
    this.AppStateModel.showLoading();
    this.requestId = e.location.path[1];
    const data = await this.OnboardingModel.getById(this.requestId);
    if ( data.state == 'loaded'){
      await this._setStateProperties(data.payload);
      await this.RtModel.getHistory(this.rtTicketId);
      this.AppStateModel.setTitle({show: true, text: this.pageTitle()});
      this.AppStateModel.setBreadcrumbs({show: true, breadcrumbs: this.breadcrumbs()});
      requestAnimationFrame(() => this.AppStateModel.showLoaded(this.id));
    } else if ( data.state == 'error' ){
      let msg = 'Unable to display onboarding request';
      if ( data.error && data.error.payload && data.error.payload.message ) msg = data.error.payload.message;
      requestAnimationFrame(() => this.AppStateModel.showError(msg));
    }
  }

  /**
   * @description Sets element state properties from onboarding request api payload
   * @param {Object} payload from /api/onboarding/id:
   */
  async _setStateProperties(payload){
    this.missingUid = payload.statusId == 9;
    const ad = payload.additionalData;
    this.request = payload;
    this.firstName = ad?.employeeFirstName || '';
    this.lastName = ad?.employeeLastName || '';
    this.rtTicketId = payload.rtTicketId || '';
    this.isActiveStatus = payload.isActiveStatus;
    this.status = payload.statusName || '';
    this.statusDescription = payload.statusDescription || '';
    this.libraryTitle = payload.libraryTitle || '';
    this.department = payload.departmentName || '';
    this.startDate = dtUtls.fmtDatetime(payload.startDate,  {dateOnly: true, UTC: true, includeDayOfWeek: true});
    this.supervisorId = payload.supervisorId || '';
    this.supervisorName = `${ad?.supervisorFirstName || ''} ${ad?.supervisorLastName || ''}`;
    this.supervisorEmail = ad?.supervisorEmail || '';
    this.notes = payload.notes || '';
    this.previousPosition = ad?.previousPosition || {};
    this.facilitiesRtTicketId = ad?.facilitiesRtTicketId || '';
    this.backgroundCheck = ad?.backgroundCheck || {};

    if ( ad?.ucdIamRecord?.record ){
      this.ucdIamRecord = new IamPersonTransform(ad.ucdIamRecord.record);
    } else {
      this.ucdIamRecord = new IamPersonTransform({});
    }
  }

  /**
   * @description Returns title for page header and breadcrumbs
   * @returns {String}
   */
  pageTitle(){
    if ( this.firstName && this.lastName ) {
      return `${this.firstName} ${this.lastName}`;
    }
    return `Request ${this.requestId}`;
  }

  /**
   * @description Returns breadcrumbs for this page
   * @returns {Array}
   */
  breadcrumbs(){
    return [
      this.AppStateModel.store.breadcrumbs.home,
      this.AppStateModel.store.breadcrumbs.onboarding,
      {text: this.pageTitle(), link: ''}
    ];
  }

  /**
   * @description Opens the reconciliation modal. Attached to button in status panel, if applicable
   */
  openReconModal(){
    this.reconId = '';
    this.querySelector('#obs-recon-modal').show();
  }

  /**
 * @description Opens the modal that displays the UC Davis IAM record. Attached to employee panel
 */
  openIamRecordModal(){
    this.querySelector('#obs-employee-modal').show();
  }

  /**
   * @description Bound to ucdlib-iam-search select event. Sets reconId property (iam id of employee to reconcile)
   * @param {*} e
   */
  _onReconEmployeeSelect(e){
    this.reconId = e.id;
  }

  /**
   * @description Called after user selects an employee and clicks the submit button in the reconciliation modal
   * Sends request to reconcile onboarding request with iam id
   * @returns
   */
  async _onReconSubmit(){
    if ( !this.reconId ) return;

    const modal = this.querySelector('#obs-recon-modal');
    modal.hide();
    const lookupEle = modal.querySelector('ucdlib-iam-search');
    lookupEle.reset();

    this.AppStateModel.showLoading();
    const r = await this.OnboardingModel.reconcile(this.requestId, this.reconId);
    if ( r.state == 'error' ){
      let msg = 'Unable to reconcile onboarding request';
      if ( r.error && r.error.payload && r.error.payload.message ) msg = r.error.payload.message;
      console.error(r);
      requestAnimationFrame(() => this.AppStateModel.showError(msg));
    } else {
      this.OnboardingModel.clearIdCache(this.requestId);
      this.OnboardingModel.clearQueryCache();
      if ( this.rtTicketId ){
        this.RtModel.clearHistoryCache(this.rtTicketId);
      }
      this.AppStateModel.setLocation('/onboarding');
      this.AppStateModel.showAlertBanner({message: 'Onboarding request reconciled', brandColor: 'farmers-market'});
    }
  }


  /**
   * @description Opens the background check modal. Attached to button in side panel
   */
  openBackgroundCheckModal(){
    this.querySelector('#obs-background-check').show();
  }

  /**
   * @description Bound to inputs in background check modal. Updates backgroundCheck property
   * @param {String} prop - property to update
   * @param {String} value - value to set
   * @param {String} inputType - type of input (checkbox, text, etc). If checkbox, value is ignored
   * @returns
   */
  _onBackgroundCheckChange(prop, value, inputType){
    if (!prop ) return;
    if ( inputType == 'checkbox' ) {
      value = this.backgroundCheck[prop] ? false : true;
    }
    this.backgroundCheck[prop] = value;
    this.requestUpdate();
  }

  /**
   * @description Called after user clicks submit button in background check modal. Sends request to send background check notification
   */
  async _onSendBackgroundCheck(){
    const modal = this.querySelector('#obs-background-check');
    modal.hide();
    console.log(this.backgroundCheck);
    this.AppStateModel.showLoading();
    const r = await this.OnboardingModel.sendBackgroundCheckNotification(this.requestId, this.backgroundCheck);
    if ( r.state == 'error' ){
      let msg = 'Unable to send background check notification';
      if ( r.error && r.error.payload && r.error.payload.message ) msg = r.error.payload.message;
      console.error(r);
      requestAnimationFrame(() => this.AppStateModel.showError(msg));
    } else {
      this.OnboardingModel.clearIdCache(this.requestId);
      this.OnboardingModel.clearQueryCache();
      if ( this.rtTicketId ){
        this.RtModel.clearHistoryCache(this.rtTicketId);
      }
      this.AppStateModel.refresh();
      this.AppStateModel.showAlertBanner({message: 'Background check notification sent', brandColor: 'farmers-market'});
    }
  }

}

customElements.define('ucdlib-iam-page-onboarding-single', UcdlibIamPageOnboardingSingle);
