import { LitElement } from 'lit';
import * as Templates from "./ucdlib-iam-page-separation-new.tpl.js";

import "../components/ucdlib-iam-search";
import "../components/ucdlib-iam-alma";
import "../components/ucdlib-iam-modal";
import "../components/ucdlib-employee-search";
import IamPersonTransform from "@ucd-lib/iam-support-lib/src/utils/IamPersonTransform";

/**
 * @description Displays onboarding request form
 */
export default class UcdlibIamPageSeparationNew extends window.Mixin(LitElement)
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
      separationDate: {state: true},
      supervisor: {state: true},
      supervisorEmail: {state: true},
      firstName: {state: true},
      lastName: {state: true},
      email: {state: true},
      employeeId: {state: true},
      userId: {state: true},
      notes: {state: true},
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

    this._injectModel('AppStateModel', 'PersonModel', 'GroupModel', 'SeparationModel');
    //this._setPage({location: this.AppStateModel.location, page: this.id}, false);
  }

  /**
   * @description Resets onboarding form values
   */
  _resetEmployeeStateProps(){
    this.iamRecord = new IamPersonTransform({});
    this.supervisor = new IamPersonTransform({});
    this.userEnteredData = false;
    this.hasAppointment = false;
    this.hasMultipleAppointments = false;
    this.appointments = [];
    this.appointmentIndex = 0;
    this.separationDate = '';
    this.firstName = '';
    this.lastName = '';
    this.email = '';
    this.employeeId = '';
    this.userId = '';
    this.skipSupervisor = false;
    this.supervisorEmail = '';
    this.notes = '';
    this.open = true;
    this.openStatus = 'Awaiting Supervisor Response';
  }

  /**
   * @param props {map} - changed properties
   * @description Lit lifecycle method before update
   */
  willUpdate(props){

    if ( props.has('iamRecord') && !this.iamRecord.isEmpty && !this.userEnteredData ){
      this._setStatePropertiesFromIamRecord(this.iamRecord);
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
   * @description Sets state properties from IAM person record class
   * @param {*} record
   */
  _setStatePropertiesFromIamRecord(record){
    this.hasAppointment = record.hasAppointment;
    this.appointments = record.appointments;
    this.hasMultipleAppointments = this.appointments.length > 1;
    this.separationDate = record.separationDate;
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
   * @description Attached to ucdlib-employee-search element in transfer page. Fires when the state changes
   * @param {*} e
   */
  _onEmployeeStatusChange(e){
    console.log(e);
    // if ( e.detail.employee ){
    //   this.record = e.detail.employee;
    // } else {
    //   this.record = {};
    // }
  }


  /**
   * @description Attached to ucd person lookup element for employee being onboarded
   * @param {Object} response
   */
  async _onEmployeeSelect(response){
    // console.log(response);
    if( response.state === this.PersonModel.store.STATE.LOADED ) {
      this.iamRecord = new IamPersonTransform(response.payload);

      // get supervisor(s) record
      try {
        this.iamRecord.allSupervisorEmployeeIds.forEach( async empId => {
          let emp = await this.PersonModel.getPersonById(empId, 'employeeId', false);
          emp = new IamPersonTransform(emp.payload);
          if ( emp.employeeId == this.iamRecord.supervisorEmployeeId ){
            this.supervisor = emp;
            this.supervisorEmail = this.supervisor.email;
          }
        });
      } catch (error) {
        this.AppStateModel.showError('Unable to load supervisor!');
        return;
      }

      this.userEnteredData = false;
      this.AppStateModel.setLocation('#submission');
    } else if (response.state === this.PersonModel.store.STATE.ERROR) {
      console.error(response);
      this.AppStateModel.showError();
    }
  }

  /**
   * @description Attached to ucd person lookup element for employee supervisor on manual entry form
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
  async _onAppointmentSelect(i){
    i = parseInt(i);
    this.appointmentIndex = i;
    const appt = this.appointments[i];
    this.startDate = appt.assocStartDate.split(' ')[0];

    // set supervisor, if different.
    // personModel object should already be cached
    if ( appt.reportsToEmplID ){
      let emp = await this.PersonModel.getPersonById(appt.reportsToEmplID, 'employeeId', false);
      this.supervisor = new IamPersonTransform(emp.payload);
      this.supervisorEmail = this.supervisor.email;
    }
  }

  /**
   * @description Resets the ucd-iam lookup forms
   */
  _resetLookupForms(){
    this.renderRoot.querySelector('#sp-lookup ucdlib-iam-search' ).reset();
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
    if ( ['submission','manual'].includes(e.location.hash) ){
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
      this._resetLookupForms();
      this.SeparationModel.clearQueryCache();
      this.AppStateModel.setLocation(`/separation`);
      this.AppStateModel.showAlertBanner({message: 'Separation request created', brandColor: 'farmers-market'});
    } else if ( e.state === this.SeparationModel.store.STATE.ERROR ) {
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
   * @description Attached #submission form supervisor edit button
   */
  _onSupervisorEdit(){
    const modal = this.renderRoot.querySelector('#sp-custom-supervisor');
    if ( modal ) modal.show();
  }

  /**
   * @description Attached to ucd-iam-search element in custom supervisor modal
   * @param {*} e
   * @returns
   */
  _onSupervisorEditSelect(e){
    if ( e.state !== 'loaded' ) {
      this.AppStateModel.showError('Unable to load supervisor!');
      return;
    }
    this.supervisor = new IamPersonTransform(e.payload);
    this.supervisorEmail = this.supervisor.email;
    const modal = this.renderRoot.querySelector('#sp-custom-supervisor');
    if ( modal ) modal.hide();
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
    if ( !this.userEnteredData && this.iamRecord.id){
      payload.iamId = this.iamRecord.id;
    }

    payload.separationDate = this.separationDate;
    payload.supervisorId = this.supervisor.id;
    payload.notes = this.notes;
    payload.skipSupervisor = this.skipSupervisor;

    additionalData.appointmentIndex = this.appointmentIndex;
    additionalData.employeeEmail = this.email;
    additionalData.supervisorEmail = this.supervisorEmail;
    additionalData.supervisorFirstName = this.supervisor.firstName;
    additionalData.supervisorLastName = this.supervisor.lastName;
    additionalData.employeeFirstName = this.firstName;
    additionalData.employeeLastName = this.lastName;
    additionalData.employeeId = this.employeeId;
    additionalData.employeeUserId = this.userId;
    additionalData.open = this.open;
    additionalData.openStatus = this.open ? this.openStatus : 'Separation Complete';

    payload.additionalData = additionalData;
    return payload;
  }

  /**
   * @description Displays error or reroutes to home if something with the page state is wrong
   * @returns
   */
  _validatePage(){
    if ( this.page === 'sp-submission' ){
      if ( !this.userEnteredData && this.iamRecord.isEmpty ){
        console.warn('missing iam record');
        this.AppStateModel.setLocation('#lookup');
        return;
      }
    }
  }

}

customElements.define('ucdlib-iam-page-separation-new', UcdlibIamPageSeparationNew);
