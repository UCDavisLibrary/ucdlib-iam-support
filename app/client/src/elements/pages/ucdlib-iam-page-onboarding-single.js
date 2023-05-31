import { LitElement } from 'lit';
import {render} from "./ucdlib-iam-page-onboarding-single.tpl.js";
import dtUtls from '@ucd-lib/iam-support-lib/src/utils/dtUtils.js';

import "../components/ucdlib-rt-history";
import "../components/ucdlib-iam-search";
import "../components/ucdlib-iam-modal";

/**
 * @description Page element for displaying a single onboarding request
 */
export default class UcdlibIamPageOnboardingSingle extends window.Mixin(LitElement)
  .with(window.LitCorkUtils) {

  static get properties() {
    return {
      requestId: {state: true},
      request: {state: true},
      firstName: {state: true},
      lastName: {state: true},
      isActiveStatus: {state: true},
      status: {state: true},
      statusDescription: {state: true},
      libraryTitle: {state: true},
      department: {state: true},
      startDate: {state: true},
      supervisorName: {state: true},
      supervisorId: {state: true},
      notes: {state: true},
      missingUid: {state: true},
      reconId: {state: true},
    };
  }

  constructor() {
    super();
    this.render = render.bind(this);
    this.requestId = '';
    this.request = {};
    this.firstName = '';
    this.lastName = '';
    this.isActiveStatus = false;
    this.status = '';
    this.libraryTitle = '';
    this.department = '';
    this.startDate = '';
    this.supervisorId = '';
    this.supervisorName = '';
    this.notes = '';
    this.statusDescription = '';
    this.missingUid = false;
    this.reconId = '';

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
    this.firstName = ad.employeeFirstName || '';
    this.lastName = ad.employeeLastName || '';
    this.rtTicketId = payload.rtTicketId || '';
    this.isActiveStatus = payload.isActiveStatus;
    this.status = payload.statusName || '';
    this.statusDescription = payload.statusDescription || '';
    this.libraryTitle = payload.libraryTitle || '';
    this.department = payload.departmentName || '';
    this.startDate = dtUtls.fmtDatetime(payload.startDate, true, true);
    this.supervisorId = payload.supervisorId || '';
    this.supervisorName = `${ad.supervisorFirstName || ''} ${ad.supervisorLastName || ''}`;
    this.notes = payload.notes || '';
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

  openReconModal(){
    this.reconId = '';
    this.querySelector('#obs-recon-modal').show();
  }

  _onReconEmployeeSelect(e){
    console.log(e);
    this.reconId = e.id;
  }

  async _onReconSubmit(){
    if ( !this.reconId ) return;
    console.log('recon', this.reconId);

    const modal = this.querySelector('#obs-recon-modal');
    modal.hide();

    const lookupEle = modal.querySelector('ucdlib-iam-search');
    lookupEle.reset();
  }

}

customElements.define('ucdlib-iam-page-onboarding-single', UcdlibIamPageOnboardingSingle);
