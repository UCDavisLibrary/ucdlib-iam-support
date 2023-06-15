import { LitElement } from 'lit';
import * as Templates from "./ucdlib-iam-page-separation-new.tpl.js";

import "../components/ucdlib-iam-alma";
import "../components/ucdlib-iam-modal";
import "../components/ucdlib-employee-search";

/**
 * @description Displays onboarding request form
 */
export default class UcdlibIamPageSeparationNew extends window.Mixin(LitElement)
  .with(window.LitCorkUtils) {

  static get properties() {
    return {
      page: {type: String},
      userEnteredData: {state: true},
      separationDate: {state: true},
      supervisor: {state: true},
      supervisorEmail: {state: true},
      firstName: {state: true},
      lastName: {state: true},
      email: {state: true},
      employeeId: {state: true},
      userId: {state: true},
      notes: {state: true},
      employeeRecord: {state:true},
      skipSupervisor: {state: true},
    };
  }

  constructor() {
    super();
    this.render = Templates.render.bind(this);
    this.renderSubmissionForm = Templates.renderSubmissionForm.bind(this);
    this.renderEmployeeForm = Templates.renderEmployeeForm.bind(this);

    this.page = 'sp-lookup';
    this._resetEmployeeStateProps();

    this._injectModel('AppStateModel', 'GroupModel', 'SeparationModel');
    //this._setPage({location: this.AppStateModel.location, page: this.id}, false);
  }


  /**
   * @description Resets onboarding form values
   */
  _resetEmployeeStateProps(){
    this.userEnteredData = false;
    this.separationDate = '';
    this.firstName = '';
    this.lastName = '';
    this.middleName = '';
    this.title = '';
    this.supervisorId = '';
    this.ucdDeptCode = '';
    this.userId = '';
    this.email = '';
    this.employeeId = '';
    this.userId = '';
    this.skipSupervisor = false;
    this.supervisorEmail = '';
    this.employeeRecord = {};
    this.supervisor = {};
    this.notes = '';
    this.open = true;
    this.openStatus = 'Awaiting Supervisor Response';

  }

  /**
   * @param props {map} - changed properties
   * @description Lit lifecycle method before update
   */
  willUpdate(props){
    if ( props.has('employeeRecord') ){
      this.hasEmployeeRecord = Object.keys(this.employeeRecord).length > 0;
    }
  }

  /**
   * @description - Disables manual form submission if missing certain form values
   * We need a supervisor, and at least one unambiguous person identifier
   * @param {*} props - Changed properties
   */
  _setManualFormDisabled(props){
    if ( props.has('supervisor') ) {
      this.manualFormDisabled = this.supervisor.isEmpty;
    }
  }

  /**
   * @description Disables the shadowdom
   * @returns
   */
  createRenderRoot() {
    return this;
  }

  /**
   * @description Opens the employee info modal
   */
  openEmployeeInfoModal(){
    const ele = this.renderRoot.querySelector('#sp-employee-modal');
    if ( ele ) ele.show();
  }

  /**
   * @method _onAppStateUpdate
   * @description bound to AppStateModel app-state-update event
   *
   * @param {Object} e
   */
  async _onAppStateUpdate(e) {
    this._setPage(e);
  }


  /**
   * @description Attached to ucdlib-employee-search element in transfer page. Fires when the state changes
   * @param {*} e
   */
  _onEmployeeStatusChange(e){
    if ( e.detail.employee ){
      this.employeeRecord = e.detail.employee;
    } else {
      this.employeeRecord = {};
    }
  }

  /**
   * @description Sets state properties from separated person record class
   */
  _onSeparateFormSubmit(){
    if ( !this.hasEmployeeRecord ) return;
    this.groups = this.employeeRecord.groups;
    this.iamId = this.employeeRecord.iamId;
    this.id = this.employeeRecord.id;
    this.middleName = this.employeeRecord.middleName;
    this.primaryAssociation = this.employeeRecord.primaryAssociation;
    this.title = this.employeeRecord.title;
    this.supervisor = this.employeeRecord.supervisor;
    this.supervisor_fullname =  this.supervisor.firstName + " " + this.supervisor.lastName;
    this.supervisorEmail = this.supervisor.email;
    this.supervisorId = this.employeeRecord.supervisorId;
    this.types = this.employeeRecord.types;
    this.ucdDeptCode = this.employeeRecord.ucdDeptCode;
    this.firstName = this.employeeRecord.firstName;
    this.lastName = this.employeeRecord.lastName;
    this.email = this.employeeRecord.email;
    this.employeeId = this.employeeRecord.employeeId;
    this.userId = this.employeeRecord.userId;
    this.page = "sp-submission";
    this.AppStateModel.setLocation('#submission');
  }



  /**
   * @description Resets the employee lookup forms
   */
  _resetLookupForms(){
    this.renderRoot.querySelector('#sp-lookup ucdlib-employee-search' ).reset();
  }

  /**
   * @description Sets subpage based on location hash
   * @param {Object} e
   */
  async _setPage(e){
    if (e.page != this.id ) return;
    this.AppStateModel.showLoading('separation-new');
    await this._getRequiredPageData(e.location.hash);
    this.AppStateModel.showLoaded();
    if ( ['submission'].includes(e.location.hash) ){
      this.page = 'sp-' + e.location.hash;
    } else {
      this.page = 'sp-lookup';
    }
    this._validatePage();
  }

  /**
   * @description Attached to submit event on onboarding form
   * @param {*} e - Submit event
   */
  _onSubmit(e){
    e.preventDefault();
    this.SeparationModel.newSubmission(this.payload());
  }

  /**
   * @description Attached to Separation Model NEW_SEPARATION_SUBMISSION event
   * @param {Object} e
   */
  _onNewSeparationSubmission(e){
    if ( e.state === this.SeparationModel.store.STATE.LOADING ){
      this.AppStateModel.showLoading(this.id);
    } else if ( e.state === this.SeparationModel.store.STATE.LOADED ){
      this._resetEmployeeStateProps();
      // this._resetLookupForms();
      this.SeparationModel.clearQueryCache();
      this.AppStateModel.setLocation(`/separation`);
      this.AppStateModel.showAlertBanner({message: 'Separation request created', brandColor: 'farmers-market'});
    } else if ( e.state === this.SeparationModel.store.STATE.ERROR ) {
      this._resetEmployeeStateProps();
      // this._resetLookupForms();
      console.error(e);
      let msg = '';
      if ( e.error.details && e.error.details.message ){
        msg =  e.error.details.message;
      }
      this.AppStateModel.showError(msg);
    }
  }

  /**
   * @description Attached #submission form supervisor edit button
   */
  _onSupervisorEdit(){
    const modal = this.renderRoot.querySelector('#sp-custom-supervisor');
    if ( modal ) modal.show();
  }


  /**
   * @description Do data retrieval required to display a subpage
   * @param {String} hash - url hash representing the subpage
   */
  async _getRequiredPageData(hash){
    const promises = [];
    if ( hash === 'submission' ){
      promises.push(this.GroupModel.getAll());
    }
    await Promise.all(promises);
  }

  /**
   * @description Makes payload for POST call when submitting a new request
   * @returns {Object}
   */
  payload(){
    const payload = {};
    const additionalData = {};
    if ( this.hasEmployeeRecord ){
      payload.iamId = this.employeeRecord.iamId;
    }

    payload.separationDate = this.separationDate;
    payload.supervisorId = this.supervisorId;
    payload.notes = this.notes;
    payload.skipSupervisor = this.skipSupervisor;
    additionalData.employeeEmail = this.email;
    additionalData.groups = this.groups;
    additionalData.id = this.id;
    additionalData.middleName = this.middleName;
    additionalData.primaryAssociation = this.primaryAssociation;
    additionalData.title = this.title;
    additionalData.types = this.types;
    additionalData.ucdDeptCode = this.ucdDeptCode;
    additionalData.supervisorEmail = this.supervisorEmail;
    additionalData.supervisorFirstName = this.supervisor.firstName;
    additionalData.supervisorLastName = this.supervisor.lastName;
    additionalData.employeeFirstName = this.firstName;
    additionalData.employeeLastName = this.lastName;
    additionalData.employeeId = this.employeeId;
    additionalData.employeeUserId = this.userId;

    payload.additionalData = additionalData;
    return payload;
  }

  /**
   * @description Displays error or reroutes to home if something with the page state is wrong
   * @returns
   */
  _validatePage(){
    if ( this.page === 'sp-submission' ){
      if (this.employeeRecord.isEmpty ){
        console.warn('missing employee record');
        this.AppStateModel.setLocation('#lookup');
        return;
      }
    }
  }

}

customElements.define('ucdlib-iam-page-separation-new', UcdlibIamPageSeparationNew);
