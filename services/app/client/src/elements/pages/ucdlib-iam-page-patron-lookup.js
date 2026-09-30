import { LitElement } from 'lit';
import * as Templates from "./ucdlib-iam-page-patron-lookup.tpl.js";
import dtUtils from '#lib/utils/dtUtils.js';
import { LitCorkUtils, Mixin } from '@ucd-lib/cork-app-utils';
import RosettaPerson from '#lib/utils/RosettaPerson.js';

import { AppComponentController } from '#controllers';

import "#components/ucdlib-iam-modal.js";

/**
 * @description Component element for querying the UC Davis IAM API
 */
export default class UcdlibIamPagePatronLookup extends Mixin(LitElement)
  .with(LitCorkUtils) {

  static get properties() {
    return {
      widgetTitle: {type: String, attribute: 'widget-title'},
      firstName: {type: String, attribute: 'first-name'},
      lastName: {type: String, attribute: 'last-name'},
      middleName: {type: String, attribute: 'middle-name'},
      studentId: {type: String, attribute: 'student-id'},
      employeeId: {type: String, attribute: 'employee-id'},
      userId: {type: String, attribute: 'user-id'},
      email: {type: String, attribute: 'email'},
      resetOnSelect: {type: Boolean, attribute: 'reset-on-select'},
      isFetching: {state: true},
      wasError: {state: true},
      page: {state: true},
      selectedPersonProfile: {state: true}
    };
  }

  constructor() {
    super();

    this.render = Templates.render.bind(this);

    this.reset();

    this.ctl = {
      appComponent : new AppComponentController(this),
    }
    this._injectModel('AppStateModel', 'AuthModel', 'AlmaUserModel', 'LdapModel', 'RosettaModel');

    this.ldap = {};

    this.informationHeader = "Sample ID";

    // display options
    this.widgetTitle = 'UC Davis Patron Lookup Search';


  }
  /**
   * @method _onAppStateUpdate
   * @description bound to AppStateModel app-state-update event
   * @param {Object} e
   */
  async _onAppStateUpdate(e) {
    if ( !this.ctl.appComponent.isOnActivePage ) return;

    const token = this.AuthModel.getToken();
    if ( token.canDoPatronSearch ){
      this._setPage(e);
    } else {
      this.AppStateModel.showError('You do not have permission to use this tool.');
    }
  }

  /**
   * @description Sets subpage based on location hash
   * @param {Object} e
   */
  async _setPage(e){
    if (this.page == "information") this._onReturn();
    this.AppStateModel.showLoading();

    this.requestId = e.location.query.iamid;

    if(this.requestId && this.requestId != ""){
      await this.getRosettaInfo();
    }

    this.ctl.appComponent.showPage();
  }

  /**
   * @description Fetches the rosetta person record for the given IAM ID and sets state properties
   * @returns 
   */
  async getRosettaInfo(){
    if(!this.requestId || this.requestId == "") return;

    const r = await this.RosettaModel.getPersonById(this.requestId, 'iamId');
    if( r.state === this.RosettaModel.store.STATE.LOADED ) {
      this.isFetching = false;
      this.selectedPersonProfile = new RosettaPerson(r.payload.results[0]).data;
      await this._setStateProperties(this.selectedPersonProfile);
      this.AppStateModel.setTitle({show: true, text: this.pageTitle()});
      this.AppStateModel.setBreadcrumbs({show: true, breadcrumbs: this.breadcrumbs()});

      const alma = await this.AlmaUserModel.getUserById(this.selectedPersonProfile?.id?.login_id);
      if(alma.error){
        this.alma = null;
        this.AppStateModel.showAlertBanner({message: 'There was an error when accessing the UC Davis Alma API. Some fields may be missing. Check with admin for further assistance.', brandColor: 'double-decker'});
      } else {
        this.alma = alma?.payload;
      }
      
      if(!this.alma.id) this.alma = null;
      
      const ldap = await this.LdapModel.query({iamId: this.selectedPersonProfile?.id?.iam_id});
      if(ldap.error){
        this.ldap = null;
        this.AppStateModel.showAlertBanner({message: 'There was an error when accessing the UC Davis LDAP. Some fields may be missing. Check with admin for further assistance.', brandColor: 'double-decker'});
      } else {
        this.ldap = ldap?.payload?.[0];
      }

      this.selectedPersonDepInfo = Array.isArray(this.selectedPersonProfile?.employee_association) && this.selectedPersonProfile?.employee_association.length === 0 ? null : this.selectedPersonProfile?.employee_association;
      this.selectedPersonStdInfo = Array.isArray(this.selectedPersonProfile?.student_association) && this.selectedPersonProfile?.student_association.length === 0 ? null : this.selectedPersonProfile?.student_association;
      this.informationHeaderID = this.selectedPersonProfile?.iam_id;
      this.page = 'information';
    } else if( r.state === this.RosettaModel.store.STATE.ERROR ) {
      this.isFetching = false;
      this.AppStateModel.showAlertBanner({message: 'There was an error when accessing the Rosetta API. Some fields may be missing. Check with admin for further assistance.', brandColor: 'double-decker'});
      this.wasError = true;
    }
    this.AppStateModel.setLocation('/patron?iamid=' + this.requestId);

    this.dispatchEvent(new CustomEvent('select', {detail: {status: r}}));
    if ( this.resetOnSelect ) this.reset();
  }

  /**
   * @description Attached to rosetta-person-selected event from rosetta-person-search element
   * @param {RosettaPerson} person data object for the selected person
   * @returns
   */
  async _onEmployeeSelect(person){
    this.requestId = person.id;
    await this.getRosettaInfo();
  }

  /**
   * @description Sets state properties based on the given RosettaPerson data object
   * @param {Object} payload a RosettaPerson data object
   */
  async _setStateProperties(payload){
    this.request = payload;
    this.displayName = payload?.displayname || '';
    this.firstName = payload?.name?.legal_first_name || '';
    this.lastName = payload?.name?.legal_last_name || '';
    this.middleName = payload?.name?.legal_middle_name || '';
    this.email = payload?.email?.campus || '';
    this.employeeId = payload?.id?.employee_id || '';
    this.studentId = payload?.id?.student_id || '';
    this.userId = payload?.id?.login_id || '';
    this.iamId = payload?.iam_id || '';
    this.mothraId = payload?.id?.mothraId || '';
    this.modifyDate = dtUtils.fmtDatetime(payload.modifyDate, true, true);
  }

  /**
   * @description Disables the shadowdom
   * @returns
   */
  createRenderRoot() {
    return this;
  }

  /**
   * @description Returns title for page header and breadcrumbs
   * @returns {String}
   */
  pageTitle(){
    if ( this.displayName ) {
      return `${this.displayName}`;
    }
    else if ( this.firstName && this.lastName ) {
      return `${this.firstName} ${this.lastName}`;
    }
    return `Request ${this.requestId}`;
  }

  /**
   * @description Returns breadcrumbs for this page
   * @returns {Array}
   */
  breadcrumbs(){
    const crumbs = [
      this.AppStateModel.store.breadcrumbs.home,
      this.AppStateModel.store.breadcrumbs.patronLookup
    ];

    crumbs.push({text: this.pageTitle(), link: ''});
    return crumbs;
  }


  /**
   * @description Resets state properties to default values
   */
  reset(){
    this.displayName = '';
    this.firstName = '';
    this.lastName = '';
    this.middleName = '';
    this.studentId = '';
    this.employeeId = '';
    this.userId = '';
    this.email = '';
    this.iamId = '';
    this.isFetching = false;
    this.wasError = false;
    this.page = 'form';
    this.selectedPersonProfile = {};
  }

  /**
   * @description return to lookup page and reset state
   */
  async _onReturn(){
    if ( this.isFetching ) return;

    // reset state
    this.wasError = false;
    this.reset();
  }

  /**
   * @description Opens the alma info modal
   */
  openAlmaInfoModal(){
    const ele = this.renderRoot.querySelector('#alma-modal');
    if ( ele ) ele.show();
  }

}

customElements.define('ucdlib-iam-page-patron-lookup', UcdlibIamPagePatronLookup);
