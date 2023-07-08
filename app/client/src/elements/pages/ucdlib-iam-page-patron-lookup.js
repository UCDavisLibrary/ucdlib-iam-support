import { LitElement } from 'lit';
import * as Templates from "./ucdlib-iam-page-patron-lookup.tpl.js";
import dtUtls from '@ucd-lib/iam-support-lib/src/utils/dtUtils.js';

import "../components/ucdlib-iam-modal";

/**
 * @description Component element for querying the UC Davis IAM API
 */
 export default class UcdlibIamPagePatronLookup extends window.Mixin(LitElement)
 .with(window.LitCorkUtils) {

  static get properties() {
    return {
      searchParam: {type: String, attribute: 'search-param'},
      widgetTitle: {type: String, attribute: 'widget-title'},
      hideNav: {type: Boolean, attribute: 'hide-nav'},
      hideNavOptions: {type: String, attribute: 'hide-nav-options'},
      firstName: {type: String, attribute: 'first-name'},
      lastName: {type: String, attribute: 'last-name'},
      middleName: {type: String, attribute: 'middle-name'},
      isDName: {type: Boolean, attribute: 'is-d-name'},
      studentId: {type: String, attribute: 'student-id'},
      employeeId: {type: String, attribute: 'employee-id'},
      userId: {type: String, attribute: 'user-id'},
      email: {type: String, attribute: 'email'},
      hideResults: {type: Boolean, attribute: 'hide-results'},
      resetOnSelect: {type: Boolean, attribute: 'reset-on-select'},
      searchParams: {state: true},
      navItems: {state: true},
      disableSearch: {state: true},
      isFetching: {state: true},
      wasError: {state: true},
      page: {state: true},
      results: {state: true},
      selectedPersonId: {state: true},
      selectedPersonProfile: {state: true}
    };
  }

  static get styles() {
    return Templates.styles();
  }

  constructor() {
    super();

    // bind templates
    this.render = Templates.render.bind(this);
    this.renderUserIdForm = Templates.renderUserIdForm.bind(this);
    this.renderEmployeeIdForm = Templates.renderEmployeeIdForm.bind(this);
    this.renderStudentIdForm = Templates.renderStudentIdForm.bind(this);
    this.renderEmailForm = Templates.renderEmailForm.bind(this);
    this.renderNameForm = Templates.renderNameForm.bind(this);

    this.reset();
    this._injectModel('PersonModel','AppStateModel', 'AuthModel', 'AlmaUserModel');

    this.navItems = [];
    this.searchParams = [
      {
        attribute: 'name',
        key: 'name',
        label: 'Name',
        requiredProps: ['firstName', 'lastName', 'middleName']
      },
      {
        attribute: 'student-id',
        key: 'studentId',
        label: 'Student ID',
        requiredProps: ['studentId']
      },
      {
        attribute: 'employee-id',
        key: 'employeeId',
        label: 'Employee ID',
        requiredProps: ['employeeId']
      },
      {
        attribute: 'user-id',
        key: 'userId',
        label: 'Kerberos',
        requiredProps: ['userId']
      },
      {
        attribute: 'email',
        key: 'email',
        label: 'Email',
        requiredProps: ['email']
      },
    ];
    this.searchParamsByKey = {};
    this.searchParams.forEach(o => {
      this.searchParamsByKey[o.key] = o;
    });

    this.searchParam = 'name';
    this.informationHeader = "Sample ID";
    // display options
    this.hideNav = false;
    this.hideNavOptions = '';
    this.widgetTitle = 'UC Davis Patron Lookup Search';

    
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
   * @description Sets subpage based on location hash
   * @param {Object} e
   */
  async _setPage(e){
    if ( e.page != this.id ) return;
    if (this.page == "information") this._onReturn();
    this.AppStateModel.showLoading(this.id);

    this.requestId = e.location.query.iamid;

    if(this.requestId && this.requestId != ""){
      this.getInformation();
    }
    

    this.AppStateModel.showLoaded();

  }


  /**
   * @description get information page data
   * @returns
   */
  async getInformation(){
    let id = this.requestId;

    const r = await this.PersonModel.getPersonById(id, 'iamId', 'select');

    if( r.state === this.PersonModel.store.STATE.LOADED ) {
      this.isFetching = false;
      this.selectedPersonProfile = r.payload;
      console.log(this.selectedPersonProfile);
      await this._setStateProperties(r.payload);
      this.AppStateModel.setTitle({show: true, text: this.pageTitle()});
      this.AppStateModel.setBreadcrumbs({show: true, breadcrumbs: this.breadcrumbs()});
      this.alma = await this.AlmaUserModel.getAlmaUserById(this.selectedPersonProfile.userID, "almaId");
      this.selectedPersonDepInfo = this.selectedPersonProfile.ppsAssociations;
      this.selectedPersonStdInfo = this.selectedPersonProfile.sisAssociations;
      this.informationHeaderID = this.selectedPersonProfile.iamId;
      this.page = 'information';
        
    } else if( r.state === this.PersonModel.store.STATE.ERROR ) {
      this.isFetching = false;
      this.wasError = true;
    }

    this.dispatchEvent(new CustomEvent('select', {detail: {status: r}}));
    if ( this.resetOnSelect ) this.reset();
  }


  /**
   * @description Sets element state properties from onboarding request api payload
   * @param {Object} payload from /api/onboarding/id:
   */
  async _setStateProperties(payload){
    this.missingUid = payload.statusId == 9;
    this.request = payload;
    this.firstName = payload.oFirstName || '';
    this.lastName = payload.oLastName || '';
    this.middleName = payload.oMiddleName || '';
    this.email = payload.email;
    this.employeeId = payload.employeeId || '';
    this.uuid = payload.uuid || '';
    this.mothraId = payload.mothraId || '';
    this.modifyDate = dtUtls.fmtDatetime(payload.modifyDate, true, true);
  }

  /**
   * @description Disables the shadowdom
   * @returns
   */
  createRenderRoot() {
    return this;
  }

  /**
   * @method _onTokenRefreshed
   * @description bound to AuthModel token-refreshed event
   * @param {AccessToken} token
   */
  _onTokenRefreshed(token){
    this.canViewActiveList = token.hasAdminAccess || token.hasHrAccess;
    this.userIamId = token.iamId;
    if ( this.AppStateModel.currentPage == this.id ) this. _getRequiredPageData();
  }

  /**
   * @description Do data retrieval required to display a subpage
   */
  async _getRequiredPageData(){
    const activeListEle = this.querySelector(`#${this.activeId}`);
    const supervisorEle = this.querySelector(`#${this.supervisorId}`);
    if ( !activeListEle || !supervisorEle ){
      return; // page not fully loaded yet. wait for next app-state-update.
    }
    const promises = [];
    if ( this.canViewActiveList ) promises.push(activeListEle.doQuery());
    if ( this.userIamId ) promises.push(supervisorEle.doQuery(false, {supervisorId: this.userIamId}));
    await new Promise(resolve => {requestAnimationFrame(resolve);});
  }

  /**
   * @description Lit lifecycle hook
   * @param {Map} props - Changed properties
   */
  willUpdate(props) {

    // validates attribute for loading element with a specified search form
    if ( props.has('searchParam') ){
      if (
        !this.searchParam ||
        !this.searchParams.map(x => x.attribute).includes(this.searchParam)
      ) {
        console.warn(`${this.searchParam} is not a recognized search parameter`);
        this.searchParam = 'name';
      }
    }

    // determines what search methods a user can choose
    if ( props.has('hideNavOptions') || props.has('searchParams') ){
      const hideOptions = this.hideNavOptions ? this.hideNavOptions.split(' ') : [];
      this.navItems = this.searchParams.filter(p => !hideOptions.includes(p.attribute));
    }

    this._setDisableSearch();
  }

  /**
   * @description Disables form submit if actively fetching or missing required inputs
   * @returns {Boolean}
   */
  _setDisableSearch(){
    if ( this.isFetching ) return true;
    const activeForm = this.activeForm();
    for (const prop of activeForm.requiredProps) {
      if ( this[prop] ) {
        this.disableSearch = false;
        return false;
      }
    }
    this.disableSearch = true;
    return true;
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
      this.AppStateModel.store.breadcrumbs.patronLookup,
      {text: this.pageTitle(), link: ''}
    ];
  }

  

  /**
   * @description Returns the 'searchParams' object for the active search form
   * @returns {Object}
   */
  activeForm(){
    return this.searchParams.find(({ attribute }) => attribute === this.searchParam);
  }

  /**
   * @description Resets element
   */
  reset(){
    this.firstName = '';
    this.lastName = '';
    this.middleName = '';
    this.isDName = false;
    this.studentId = '';
    this.employeeId = '';
    this.userId = '';
    this.email = '';
    this.iamId = '';
    this.isFetching = false;
    this.wasError = false;
    this.page = 'form';
    this.hideResults = false;
    this.results = [];
    this.selectedPersonId = '';
    this.selectedPersonProfile = {};
  }
  /**
   * @description return to lookup page
   * @param {*} e - Submit event
   */
  async _onReturn(e){
    if ( this.isFetching ) return;
    console.log(e);
    // reset state
    this.wasError = false;
    this.reset();
    this.AppStateModel.setLocation('/patron');

  }

  /**
   * @description Attached to submit event on element form
   * @param {*} e - Submit event
   */
  async _onSubmit(e){
    e.preventDefault();
    if ( this.isFetching ) return;

    // reset state
    this.wasError = false;
    this.isFetching = true;

    const selectedParam = this.searchParams.find(({ attribute }) => attribute === this.searchParam);
    let r;
    if ( selectedParam.key === 'name' ){
      r = await this.PersonModel.getPersonByName(this.lastName, this.firstName, this.middleName, this.isDName);
    } else {
      r = await this.PersonModel.getPersonById(this[selectedParam.key].toLowerCase(), selectedParam.key);
    }

    if ( r.state === this.PersonModel.store.STATE.LOADED ) {
      this.isFetching = false;
      this.results = Array.isArray(r.payload) ? r.payload : [r.payload];
      if ( !this.hideResults ){
        this.page = 'results';
      }
    } else if( r.state === this.PersonModel.store.STATE.ERROR ) {
      this.isFetching = false;
      if ( r.error.payload && r.error.payload.response && r.error.payload.response.status == 404) {
        this.results = [];
        if ( !this.hideResults ){
          this.page = 'results';
        }
      } else {
        this.wasError = true;
      }
    }

    this.dispatchEvent(new CustomEvent('search', {detail: {status: r}}));
  }

  /**
   * @description Attached to click listeners on results page
   * @param {Number} id - IAM ID
   * @returns
   */
  async _onPersonClick(id){
    if ( this.isFetching ) return;

    this.wasError = false;
    this.isFetching = true;

    // this.AppStateModel.setLocation('/patron#' + id);
    /* This is for when the query option works */
    this.AppStateModel.setLocation('/patron?iamid=' + id);


    this.AppStateModel.refresh();
    
    

  }

  /**
   * @description Opens the employee info modal
   */
  openAlmaInfoModal(){
    const ele = this.renderRoot.querySelector('#alma-modal');
    if ( ele ) ele.show();
  }

}

customElements.define('ucdlib-iam-page-patron-lookup', UcdlibIamPagePatronLookup);