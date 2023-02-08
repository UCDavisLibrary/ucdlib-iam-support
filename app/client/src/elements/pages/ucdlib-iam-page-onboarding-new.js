import { LitElement } from 'lit';
import {render} from "./ucdlib-iam-page-onboarding-new.tpl.js";

import "../components/ucdlib-iam-search";
import "../components/ucdlib-iam-modal";

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
      hasSupervisor: {state: true}
    };
  }

  constructor() {
    super();
    this.render = render.bind(this);

    this.iamRecord = {};
    this.userEnteredData = false;
    this.hasSupervisor = false;
    this.hasAppointment = false;
    this.hasMultipleAppointments = false;
    this.appointments = [];
    this.appointmentIndex = 0;
    this.startDate = '';

    this._injectModel('AppStateModel', 'PersonModel');
    this._setPage({location: this.AppStateModel.location, page: this.id});
  }

  /**
   * @param props {map} - changed properties
   * @description Lit lifecycle method before update
   */
  willUpdate(props){

    // set state properties from iam record
    if ( 
      props.has('iamRecord') && 
      this.iamRecord &&
      Object.keys(this.iamRecord).length &&
      !this.userEnteredData){
      const r = this.iamRecord;
      this.hasAppointment = r.ppsAssociations && r.ppsAssociations.length;
      this.appointments = this.hasAppointment ? r.ppsAssociations : [];
      this.hasMultipleAppointments = r.ppsAssociations && r.ppsAssociations.length > 1;
      this.startDate = this.hasAppointment ? r.ppsAssociations[0].assocStartDate.split(' ')[0]: '';
    }
  }

  /**
   * @description Disables the shadowdom
   * @returns 
   */
  createRenderRoot() {
    return this;
  }

  openEmployeeInfoModal(){
    const ele = this.renderRoot.querySelector('#obn-employee-modal');
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
   * @description Attached to PersonModel SELECT_UPDATE event
   * @param {Object} e SELECT_UPDATE event state
   */
  _onSelectUpdate(e){
    this.wasError = false;
    if( e.state === this.PersonModel.store.STATE.LOADED ) {
      this.iamRecord = e.payload;
      this.userEnteredData = false;
      this.AppStateModel.setLocation('#submission');
    }
  }

  /**
   * @description Sets page based on location hash
   * @param {Object} e 
   */
  _setPage(e){
    if (e.page != this.id ) return;
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
    console.log('submit!');
  }

  /**
   * @description Reroutes to home if something with the page state is wrong
   * @returns 
   */
  _validatePage(){
    if ( this.page === 'obn-submission' ){
      if ( !this.userEnteredData && (!this.iamRecord || !Object.keys(this.iamRecord).length) ){
        console.warn('missing iam record');
        this.AppStateModel.setLocation('#home');
        return;
      }
    }
  }

}

customElements.define('ucdlib-iam-page-onboarding-new', UcdlibIamPageOnboardingNew);