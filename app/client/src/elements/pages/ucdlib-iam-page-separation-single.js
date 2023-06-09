import { LitElement } from 'lit';
import {render} from "./ucdlib-iam-page-separation-single.tpl.js";
import dtUtls from '@ucd-lib/iam-support-lib/src/utils/dtUtils.js';
import "../components/ucdlib-rt-history";
import "../components/ucdlib-iam-search";
import "../components/ucdlib-iam-modal";
/**
 * @description Page element for displaying a single separation request
 */
export default class UcdlibIamPageSeparationSingle extends window.Mixin(LitElement)
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
    this.open = "The employee's former supervisor must finish to offboarding checklist in order to mark complete offboarding process.";
    this.closed = "Former employees offboarding is now marked as complete.";

    this._injectModel('AppStateModel', 'SeparationModel', 'RtModel');
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
    console.log(props);
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
    const ad = payload.additionalData;
    this.request = payload;
    this.firstName = ad?.employeeFirstName || '';
    this.lastName = ad?.employeeLastName || '';
    this.employeeId = ad?.employeeId || '';
    this.employeeUserId = ad?.employeeUserId || '';
    this.rtTicketId = payload.rtTicketId || '';
    this.separationDate = dtUtls.fmtDatetime(payload.separationDate, true, true);
    this.supervisorId = payload.supervisorId || '';
    this.supervisorName = `${ad?.supervisorFirstName || ''} ${ad?.supervisorLastName || ''}`;
    this.notes = payload.notes || '';
    this.isActiveStatus = ad?.open || false;
    this.status = ad?.openStatus || '';
    this.statusDescription = ad?.open ? this.open : this.closed;
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
   * @description Opens the reconciliation modal. Attached to button in status panel, if applicable
   */
  openReconModal(){
    this.reconId = '';
    this.querySelector('#obs-recon-modal').show();
  }

  /**
   * @description Bound to ucdlib-iam-search select event. Sets reconId property (iam id of employee to reconcile)
   * @param {*} e
   */
  _onReconEmployeeSelect(e){
    this.reconId = e.id;
  }



  /**
   * @description Mark as the checklist for offboarding complete
   * @param {*} 
   */
  async _changeStatus(){
    if(this.isActiveStatus) {
      this.isActiveStatus = false;
      this.statusDescription = this.closed;
      this.status = "Separation Complete";
    } else {
      this.isActiveStatus = true;
      this.statusDescription = this.open;
      this.status = "Awaiting Supervisor Response";
    }
    this.request.additionalData.open = this.isActiveStatus;
    let change = {"additional_data":this.request.additionalData};
    const r = await this.SeparationModel.getById(this.requestId, change);
    console.log("R:", r);

  }

  /**
   * @description Called after user selects an employee and clicks the submit button in the reconciliation modal
   * Sends request to reconcile separation request with iam id
   * @returns
   */
  async _onReconSubmit(){
    if ( !this.reconId ) return;

    const modal = this.querySelector('#obs-recon-modal');
    modal.hide();
    const lookupEle = modal.querySelector('ucdlib-iam-search');
    lookupEle.reset();

    this.AppStateModel.showLoading();
    const r = await this.SeparationModel.reconcile(this.requestId, this.reconId);
    if ( r.state == 'error' ){
      let msg = 'Unable to reconcile separation request';
      if ( r.error && r.error.payload && r.error.payload.message ) msg = r.error.payload.message;
      console.error(r);
      requestAnimationFrame(() => this.AppStateModel.showError(msg));
    } else {
      this.SeparationModel.clearIdCache(this.requestId);
      this.SeparationModel.clearQueryCache();
      if ( this.rtTicketId ){
        this.RtModel.clearHistoryCache(this.rtTicketId);
      }
      this.AppStateModel.setLocation('/separation');
      this.AppStateModel.showAlertBanner({message: 'Separation request reconciled', brandColor: 'farmers-market'});
    }
  }

}

customElements.define('ucdlib-iam-page-separation-single', UcdlibIamPageSeparationSingle);
