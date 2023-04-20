import { LitElement } from 'lit';
import * as Templates from "./ucdlib-iam-alma.tpl.js";
import "../components/ucdlib-iam-modal";
import AlmaTransform from "@ucd-lib/iam-support-lib/src/utils/AlmaTransform";

/**
 * @description Component element for querying the UC Davis Alma API
 * 
 * Example
 *    <div class="l-container">
        <div class="panel o-box" style="border: 1px solid #ffbf00;">
          <ucdlib-iam-alma
              search-param='name' 
              class='u-space-px--medium u-space-py--medium u-align--auto'>
            </ucdlib-iam-alma>
        </div>
      </div>
 */
export default class UcdlibIamAlma extends window.Mixin(LitElement)
  .with(window.LitCorkUtils) {

  static get properties() {
    return {
      searchParam: {type: String, attribute: 'search-param'},
      hideNav: {type: Boolean, attribute: 'hide-nav'},
      hideNavOptions: {type: String, attribute: 'hide-nav-options'},
      firstName: {type: String, attribute: 'first-name'},
      lastName: {type: String, attribute: 'last-name'},
      almaId: {type: String, attribute: 'alma-id'},
      roles: {type: Array, attribute: 'roles'},
      hideResults: {type: Boolean, attribute: 'hide-results'},
      searchParams: {state: true},
      navItems: {state: true},
      disableSearch: {state: true},
      disableCopyPermissions:  {state: false},
      isFetching: {state: true},
      wasError: {state: true},
      page: {state: true},
      results: {state: true},
      selectedAlmaId: {state: true},
      selectedAlmaProfile: {state: true},
      almaRecord: {state: true},
      status: {state: true},
      userId: {state: true},
      userEnteredData: {state: true},
      isLookUp: {state: true},
      user_roles: {type: Array, attribute: 'user-roles'},
    };
  }

  static get styles() {
    return Templates.styles();
  }

  constructor() {
    super();

    // bind templates
    this.render = Templates.render.bind(this);
    this.renderAlmaIdForm = Templates.renderAlmaIdForm.bind(this);
    this.renderNameForm = Templates.renderNameForm.bind(this);
    
    this._injectModel('AppStateModel', 'AlmaUserModel');
    this.roles = [];
    this.page = 'alma-home';
    this.isLookUp = true;
    this.navItems = [];
    this.status = '';
    this.userId = '';
    this.searchParams = [
      {
        attribute: 'name',
        key: 'name',
        label: 'Name',
        requiredProps: ['firstName', 'lastName']
      },
      {
        attribute: 'alma-id',
        key: 'almaId',
        label: 'Alma ID',
        requiredProps: ['almaId']
      },
    ];
    this.searchParamsByKey = {};
    this.searchParams.forEach(o => {
      this.searchParamsByKey[o.key] = o;
    });

    this.searchParam = 'name';
    
    // display options
    this.hideNav = false;
    this.hideNavOptions = '';
    this._resetEmployeeStateProps();

    this.reset();
  }

  /**
   * @description Resets onboarding form values
   */
  _resetEmployeeStateProps(){
    this.almaRecord = new AlmaTransform({});
    this.userEnteredData = false;
    this.firstName = '';
    this.lastName = '';
    this.middleName = '';
    this.account_type = '';
    this.campus_code = '';
    this.contact_info = {};
    this.user_roles = [];
    this.status = '';
    this.userId = '';
  }

  /**
   * @description Opens the modal with the user search form
   */
  openUserSearchModal(){
    const ele = this.renderRoot.querySelector('#user-search-modal');
    if ( ele ) ele.show();
  }

  /**
   * @description Opens the employee info modal
   */
  openEmployeeInfoModal(){
    const ele = this.renderRoot.querySelector('#alma-employee-modal');
    if ( ele ) ele.show();
  }


  /**
   * @description Resets the ucd-iam lookup forms
   */
  _resetLookupForms(){
    this.renderRoot.querySelector('#alma-manual ucdlib-iam-search' ).reset();
    
  }

  /**
   * @description Attached to manual form submit button click
   */
  _onAlmaFormSubmit(){
    this.userEnteredData = true;
    this.AppStateModel.setLocation('#submission');
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

    if ( props.has('almaRecord') && !this.almaRecord.isEmpty && !this.userEnteredData ){
      this._setStatePropertiesFromAlmaRecord(this.almaRecord);

    }

    this._setDisableSearch();

    if (props.has('user_roles')) {
      this.dispatchEvent(new CustomEvent('role-select', {detail: {roles: this.user_roles || []}}));
    }

  }

  /**
   * @description Sets state properties from Alma record class
   * @param {*} record 
   */
  _setStatePropertiesFromAlmaRecord(record){
    this.firstName = record.firstName;
    this.lastName = record.lastName;
    this.middleName = record.middleName;
    this.account_type = record.account_type;
    this.campus_code = record.campus_code;
    this.contact_info = record.contact_info;
    this.status = record.status;
    this.userId = record.userId;
    let uRoles = record.user_roles;
    let roleArr = [];
    for (let u of uRoles) {
      let name = u.role_type["desc"];
      roleArr.push(name);
    }
    this.user_roles = roleArr;

  }
  

  /**
   * @description Disables form submit if actively fetching or missing required inputs
   * @returns {Boolean}
   */
  _setDisableSearch(){
    if ( this.as ) return true;
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
    this.almaId = '';

    this.isFetching = false;
    this.wasError = false;
    this.page = 'form';
    this.hideResults = false;
    this.results = [];
    this.selectedAlmaId = '';
    this.selectedAlmaProfile = {};
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
      r = await this.AlmaUserModel.getAlmaUserByName(this.lastName, this.firstName);
    } else if (selectedParam.key === 'almaId') {
      r = await this.AlmaUserModel.getAlmaUserById(this[selectedParam.key], selectedParam.key);
    }// } else {
    //   r = await this.AlmaUserModel.getAlmaUserRoleType(); 
    // }
    let allRoles = await this.AlmaUserModel.getAlmaUserRoleType();

    if ( r.state === this.AlmaUserModel.store.STATE.LOADED ) {
      if('user' in r.payload) r = r.payload.user;
      else if('users' in r.payload) r = r.payload.users.user;

      this.isFetching = false;
      this.results = Array.isArray(r) ? r : [r];
      this.roles = allRoles.payload.row;
      if ( !this.hideResults ){
        this.page = 'results';
      }
    } else if( r.state === this.AlmaUserModel.store.STATE.ERROR ) {
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

  _onRoletypeUpdate(e){
    if ( e.state == 'loaded'){
      this.roles = e.payload.row;
    } 
  }
  
  /**
   * @description Displays error or reroutes to home if something with the page state is wrong
   * @returns 
   */
  _validatePage(){
    if ( this.page === 'alma-submission' ){
      if ( !this.userEnteredData && this.almaRecord.isEmpty ){
        console.warn('missing alma record');
        this.AppStateModel.setLocation('#home');
        return;
      }
    } 
  }

  /**
   * @description Sets subpage based on location hash
   * @param {Object} e 
   */
  async _setPage(e){
    if (e.page != this.id ) return;
  
    this.AppStateModel.showLoading('alma');
    await this._getRequiredPageData(e.location.hash);
    this.AppStateModel.showLoaded();
    if ( ['submission', 'manual', 'lookup'].includes(e.location.hash) ){
      this.page = 'alma-' + e.location.hash;
    } else {
      this.page = 'alma-home';
    }
    this._validatePage();
  }

  /**
   * @description Attached to click listeners on results page
   * @param {Number} id - IAM ID
   * @returns 
   */
  async _onUserClick(id){
    if ( this.isFetching ) return;

    this.wasError = false;
    this.isFetching = true;

    this.selectedAlmaId = id;
    const r = await this.AlmaUserModel.getAlmaUserById(id, 'almaId', 'select');

    if( r.state === this.AlmaUserModel.store.STATE.LOADED ) {
      this.isFetching = false;
      this.selectedAlmaProfile = r.payload;
    } else if( r.state === this.AlmaUserModel.store.STATE.ERROR ) {
      this.isFetching = false;
      this.wasError = true;
    }


    this.dispatchEvent(new CustomEvent('select', {detail: {status: r}}));
    this.almaRecord = new AlmaTransform(this.selectedAlmaProfile);

    this.userEnteredData = false;
    const ele = this.renderRoot.querySelector('#user-search-modal');
    if ( ele ) ele.hide();
  }

}

customElements.define('ucdlib-iam-alma', UcdlibIamAlma);