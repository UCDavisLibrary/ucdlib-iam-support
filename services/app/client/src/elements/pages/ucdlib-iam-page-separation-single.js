import { LitElement } from 'lit';
import {render} from "./ucdlib-iam-page-separation-single.tpl.js";
import { LitCorkUtils, Mixin } from '@ucd-lib/cork-app-utils';
import dtUtls from '@ucd-lib/iam-support-lib/src/utils/dtUtils.js';
import "../components/ucdlib-rt-history";
import "../components/ucdlib-iam-search";
import "../components/ucdlib-iam-modal";
/**
 * @description Page element for displaying a single separation request
 */
export default class UcdlibIamPageSeparationSingle extends Mixin(LitElement)
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
      libraryTitle: {state: true},
      department: {state: true},
      startDate: {state: true},
      supervisorName: {state: true},
      supervisorId: {state: true},
      notes: {state: true},
      missingUid: {state: true},
      reconId: {state: true},
      showDeprovisionButton: {state: true}
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
    this.separationDate = '';
    this.supervisorId = '';
    this.supervisorName = '';
    this.notes = '';
    this.statusDescription = '';
    this.missingUid = false;
    this.reconId = '';
    this.rtTicketId = '';
    this.employeeUserId = '';
    this.employeeId = '';
    this.showDeprovisionButton = false;
    this._injectModel('AppStateModel', 'SeparationModel', 'RtModel', 'AuthModel');
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
    const data = await this.SeparationModel.getById(this.requestId);
    if ( data.state == 'loaded'){
      await this._setStateProperties(data.payload);
      await this.RtModel.getHistory(this.rtTicketId);
      this.AppStateModel.setTitle({show: true, text: this.pageTitle()});
      this.AppStateModel.setBreadcrumbs({show: true, breadcrumbs: this.breadcrumbs()});
      requestAnimationFrame(() => this.AppStateModel.showLoaded(this.id));
    } else if ( data.state == 'error' ){
      let msg = 'Unable to display separation request';
      if ( data.error && data.error.payload && data.error.payload.message ) msg = data.error.payload.message;
      requestAnimationFrame(() => this.AppStateModel.showError(msg));
    }
  }

  /**
   * @description Sets element state properties from separation request api payload
   * @param {Object} payload from /api/separation/id:
   */
  async _setStateProperties(payload){
    this.missingUid = payload.statusId == 9;
    const ad = payload.additionalData;
    this.request = payload;
    this.firstName = ad?.employeeFirstName || '';
    this.lastName = ad?.employeeLastName || '';
    this.employeeId = ad?.employeeId || '';
    this.employeeUserId = ad?.employeeUserId || '';
    this.department = ad?.departmentName || '';
    this.rtTicketId = payload.rtTicketId || '';
    this.separationDate = dtUtls.fmtDatetime(payload.separationDate, {dateOnly: true, UTC: true, includeDayOfWeek: true});
    this.supervisorId = payload.supervisorId || '';
    this.supervisorName = `${ad?.supervisorFirstName || ''} ${ad?.supervisorLastName || ''}`;
    this.notes = payload.notes || '';
    this.isActiveStatus = payload.isActiveStatus;
    this.status = payload.statusName || '';
    this.statusDescription = payload.statusDescription || '';

    this.showDeprovisionButton = this.AuthModel.isAdmin &&
      (Array.isArray(ad?.removedFromSystems) && !ad.removedFromSystems.find(s => s?.value === 'ucdlib-iam-db'));
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
      this.AppStateModel.store.breadcrumbs.separation,
      {text: this.pageTitle(), link: ''}
    ];
  }

  /**
   * @description Opens the deprovision employee confirmation modal. Attached to button in side panel
   */
  openDeprovisionEmployeeConfirmModal(){
    this.querySelector('#ss-iam-deprovision-modal').show();
  }

  /**
   * @description Called after user confirms deprovisioning of employee from library iam system
   */
  async _onDeprovisionEmployeeConfirm(){
    const modal = this.querySelector('#ss-iam-deprovision-modal');
    modal.hide();
    this.AppStateModel.showLoading();
    const r = await this.SeparationModel.deprovision(this.requestId);
    if ( r.state == 'error' ){
      let msg = 'Unable to deprovision employee';
      if ( r.error?.payload?.message ) msg = r.error.payload.message;
      console.error(r);
      requestAnimationFrame(() => this.AppStateModel.showError(msg));
    } else {
      this.SeparationModel.clearIdCache(this.requestId);
      this.SeparationModel.clearQueryCache();
      if ( this.rtTicketId ){
        this.RtModel.clearHistoryCache(this.rtTicketId);
      }
      this.AppStateModel.refresh();
      this.AppStateModel.showAlertBanner({message: 'Employee account deprovisioned', brandColor: 'farmers-market'});
    }
  }
}

customElements.define('ucdlib-iam-page-separation-single', UcdlibIamPageSeparationSingle);
