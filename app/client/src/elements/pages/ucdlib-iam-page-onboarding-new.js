import { LitElement } from 'lit';
import * as Templates from "./ucdlib-iam-page-onboarding-new.tpl.js";

import "../components/ucdlib-iam-search";
import "../components/ucdlib-iam-modal";
import IamPersonTransform from "@ucd-lib/iam-support-lib/src/utils/IamPersonTransform";

/**
 * @description Displays onboarding request form
 */
export default class UcdlibIamPageOnboardingNew extends window.Mixin(LitElement)
  .with(window.LitCorkUtils) {

  static get properties() {
    return {
      page: {type: String},
      iamRecord: {state: true},
      userEnteredData: {state: true},
      hasAppointment: {state: true},
      hasMultipleAppointments: {state: true},
      appointments: {state: true},
      appointmentIndex: {state: true},
      startDate: {state: true},
      supervisor: {state: true},
      supervisorEmail: {state: true},
      departmentId: {state: true},
      positionTitle: {state: true},
      groupIds: {state: true},
      groups: {state: true},
      isDeptHead: {state: true},
      firstName: {state: true},
      lastName: {state: true},
      email: {state: true},
      employeeId: {state: true},
      userId: {state: true},
      manualFormDisabled: {state: true},
      skipSupervisor: {state: true},
      notes: {state: true}
    };
  }

  constructor() {
    super();
    this.render = Templates.render.bind(this);
    this.renderHome = Templates.renderHome.bind(this);
    this.renderSubmissionForm = Templates.renderSubmissionForm.bind(this);
    this.renderEmployeeForm = Templates.renderEmployeeForm.bind(this);
    this.renderManualEntryForm = Templates.renderManualEntryForm.bind(this);
    
    this.page = 'obn-home';
    this.groups = [];
    this._resetEmployeeStateProps();

    this._injectModel('AppStateModel', 'PersonModel', 'GroupModel', 'OnboardingModel');
    //this._setPage({location: this.AppStateModel.location, page: this.id}, false);
  }

  /**
   * @description Resets onboarding form values
   */
  _resetEmployeeStateProps(){
    console.log('reseting props');
    this.iamRecord = new IamPersonTransform({});
    this.supervisor = new IamPersonTransform({});
    this.userEnteredData = false;
    this.hasAppointment = false;
    this.hasMultipleAppointments = false;
    this.appointments = [];
    this.appointmentIndex = 0;
    this.departmentId = 0;
    this.startDate = '';
    this.groupIds = [];
    this.isDeptHead = false;
    this.positionTitle = '';
    this.firstName = '';
    this.lastName = '';
    this.email = '';
    this.employeeId = '';
    this.userId = '';
    this.skipSupervisor = false;
    this.supervisorEmail = '';
    this.notes = '';
  }

  /**
   * @param props {map} - changed properties
   * @description Lit lifecycle method before update
   */
  willUpdate(props){

    if ( props.has('iamRecord') && !this.iamRecord.isEmpty && !this.userEnteredData ){
      this._setStatePropertiesFromIamRecord(this.iamRecord);
    }
    this._setManualFormDisabled(props);
  }

  /**
   * @description - Disables manual form submission if missing certain form values
   * We need a supervisor, and at least one unambiguous person identifier
   * @param {*} props - Changed properties
   */
  _setManualFormDisabled(props){
    let needUpdate = false;
    let canSubmit = false;
    const employeePropsToCheck = ['email', 'employeeId', 'userId'];
    for (const p of employeePropsToCheck) {
      if ( props.has(p) ) {
        needUpdate = true;
      }
      if ( this[p] ) canSubmit = true;
    }
    if ( !needUpdate && props.has('supervisor') ) needUpdate = true;
    if ( this.supervisor.isEmpty ) canSubmit = false;

    if ( needUpdate ){
      this.manualFormDisabled = !canSubmit;
    }
  }

  /**
   * @description Attached to manual form submit button click
   */
  _onManualFormSubmit(){
    this.userEnteredData = true;
    this.AppStateModel.setLocation('#submission');
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
    const ele = this.renderRoot.querySelector('#obn-employee-modal');
    if ( ele ) ele.show();
  }

  /**
   * @description Sets state properties from IAM person record class
   * @param {*} record 
   */
  _setStatePropertiesFromIamRecord(record){
    this.hasAppointment = record.hasAppointment;
    this.appointments = record.appointments;
    this.hasMultipleAppointments = this.appointments.length > 1;
    this.startDate = record.startDate;
    this.firstName = record.firstName;
    this.lastName = record.lastName;
    this.email = record.email;
    this.employeeId = record.employeeId;
    this.userId = record.userId;
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
   * @description Attached to ucd person lookup element for employee being onboarded
   * @param {Object} response 
   */
  _onEmployeeSelect(response){
    if( response.state === this.PersonModel.store.STATE.LOADED ) {
      this.iamRecord = new IamPersonTransform(response.payload);
      this.userEnteredData = false;
      this.AppStateModel.setLocation('#submission');
    } else if (response.state === this.PersonModel.store.STATE.ERROR) {
      console.error(response);
      this.AppStateModel.showError();
    }
  }

  /**
   * @description Attached to ucd person lookup element for employee supervisor
   * @param {Object} response 
   */
  _onSupervisorSelect(response){
    if( response.state === this.PersonModel.store.STATE.LOADED ) {
      this.supervisor = new IamPersonTransform(response.payload);
      this.supervisorEmail = this.supervisor.email;
    } else if (response.state === this.PersonModel.store.STATE.ERROR) {
      console.error(response);
      this.AppStateModel.showError();
    }
  }

  /**
   * @description attached to appointment select element
   * @param {Number} i - index of appointment in iam ppsassociations array
   */
  _onAppointmentSelect(i){
    i = parseInt(i);
    this.appointmentIndex = i;
    const appt = this.appointments[i];
    this.startDate = appt.assocStartDate.split(' ')[0];

  }

  /**
   * @description Resets the ucd-iam lookup forms
   */
  _resetLookupForms(){
    this.renderRoot.querySelector('#obn-lookup ucdlib-iam-search' ).reset();
    this.renderRoot.querySelector('#obn-manual ucdlib-iam-search' ).reset();
    
  }

  /**
   * @description Attached to GroupModel GROUPS_FETCHED event
   * @param {Object} e 
   */
  _onGroupsFetched(e){
    if ( e.state === this.GroupModel.store.STATE.LOADED ){
      this.groups = e.payload.filter(g => !g.archived);
      this.departmentId = this.groups.length ? this.groups[0].id : 0;
    } else if ( e.state === this.GroupModel.store.STATE.ERROR ) {
      console.error('Cannot display page. Groups not loaded!');
      this.AppStateModel.showError('Unable to load department list.');
    }
  }

  /**
   * @description Sets subpage based on location hash
   * @param {Object} e 
   */
  async _setPage(e){
    if (e.page != this.id ) return;
  
    this.AppStateModel.showLoading('onboarding-new');
    await this._getRequiredPageData(e.location.hash);
    this.AppStateModel.showLoaded();
    if ( ['submission', 'manual', 'lookup'].includes(e.location.hash) ){
      this.page = 'obn-' + e.location.hash;
    } else {
      this.page = 'obn-home';
    }
    this._validatePage();
  }

  /**
   * @description Attached to submit event on onboarding form
   * @param {*} e - Submit event
   */
  _onSubmit(e){
    e.preventDefault();
    this.OnboardingModel.newSubmission(this.payload());
  }

  /**
   * @description Attached to Onboarding Model NEW_ONBOARDING_SUBMISSION event
   * @param {Object} e 
   */
  _onNewOnboardingSubmission(e){
    if ( e.state === this.OnboardingModel.store.STATE.LOADING ){
      this.AppStateModel.showLoading(this.id);
    } else if ( e.state === this.OnboardingModel.store.STATE.LOADED ){
      this._resetEmployeeStateProps();
      this._resetLookupForms();
      this.OnboardingModel.clearQueryCache();
      this.AppStateModel.setLocation(`/onboarding`);
    } else if ( e.state === this.OnboardingModel.store.STATE.ERROR ) {
      this._resetEmployeeStateProps();
      this._resetLookupForms();
      console.error(e);
      let msg = '';
      if ( e.error.details && e.error.details.message ){
        msg =  e.error.details.message;
      }
      this.AppStateModel.showError(msg);
    }
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
    if ( this.userEnteredData ){
      additionalData.employeeId = this.employeeId;
      additionalData.employeeUserId = this.userId;
    } else {
      payload.iamId = this.iamRecord.id;
    }

    payload.startDate = this.startDate;
    payload.libraryTitle = this.positionTitle;
    payload.groupIds = [this.departmentId, ...this.groupIds].map(g => parseInt(g));
    payload.supervisorId = this.supervisor.id;
    payload.notes = this.notes;
    payload.skipSupervisor = this.skipSupervisor;

    additionalData.appointmentIndex = this.appointmentIndex;
    additionalData.isDeptHead = this.isDeptHead;
    additionalData.employeeEmail = this.email;
    additionalData.supervisorEmail = this.supervisorEmail;
    additionalData.employeeFirstName = this.firstName;
    additionalData.employeeLastName = this.lastName;
    payload.additionalData = additionalData;
    return payload;
  }

  /**
   * @description Displays error or reroutes to home if something with the page state is wrong
   * @returns 
   */
  _validatePage(){
    if ( this.page === 'obn-submission' ){
      if ( !this.userEnteredData && this.iamRecord.isEmpty ){
        console.warn('missing iam record');
        this.AppStateModel.setLocation('#home');
        return;
      }
    } 
  }

}

customElements.define('ucdlib-iam-page-onboarding-new', UcdlibIamPageOnboardingNew);