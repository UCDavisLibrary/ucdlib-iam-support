import { LitElement } from 'lit';
import * as Templates from "./ucdlib-iam-search.tpl.js";

/**
 * @description Component element for querying the UC Davis IAM API
 */
export default class UcdlibIamSearch extends window.Mixin(LitElement)
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

    this._injectModel('PersonModel');

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
    this.isFetching = false;
    this.wasError = false;
    this.page = 'form';
    this.hideResults = false;
    this.results = [];
    this.selectedPersonId = '';
    this.selectedPersonProfile = {};

    this.searchParam = 'name';
    
    // display options
    this.hideNav = false;
    this.hideNavOptions = '';
    this.widgetTitle = 'UC Davis Employee Search';

    // user inputs
    this.firstName = '';
    this.lastName = '';
    this.middleName = '';
    this.isDName = false;
    this.studentId = '';
    this.employeeId = '';
    this.userId = '';
    this.email = '';
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
   * @description Returns the 'searchParams' object for the active search form
   * @returns {Object}
   */
  activeForm(){
    return this.searchParams.find(({ attribute }) => attribute === this.searchParam);
  }

  /**
   * @description Attached to submit event on element form
   * @param {*} e - Submit event
   */
  async _onSubmit(e){
    e.preventDefault();

    const selectedParam = this.searchParams.find(({ attribute }) => attribute === this.searchParam);
    if ( selectedParam.key === 'name' ){
      this.PersonModel.getPersonByName(this.lastName, this.firstName, this.middleName, this.isDName);
    } else {
      this.PersonModel.getPersonById(this[selectedParam.key], selectedParam.key);
    }
    
  }

  /**
   * @description Attached to PersonModel SELECT_UPDATE event
   * @param {Object} e SELECT_UPDATE event state
   */
  _onSelectUpdate(e){
    this.wasError = false;
    if( e.state === this.PersonModel.store.STATE.LOADING ) {
      this.isFetching = true;
    } else if( e.state === this.PersonModel.store.STATE.LOADED ) {
      this.isFetching = false;
      this.selectedPersonProfile = e.payload;
    } else if( e.state === this.PersonModel.store.STATE.ERROR ) {
      this.isFetching = false;
      this.wasError = true;
    }
  }

  /**
   * @description Attached to PersonModel SEARCH_UPDATE event
   * @param {Object} e SEARCH_UPDATE event state
   */
  _onSearchUpdate(e){
    this.wasError = false;
    if( e.state === this.PersonModel.store.STATE.LOADING ) {
      this.isFetching = true;
    } else if( e.state === this.PersonModel.store.STATE.LOADED ) {
      this.isFetching = false;
      this.results = Array.isArray(e.payload) ? e.payload : [e.payload];
      if ( !this.hideResults ){
        this.page = 'results';
      }
    } else if( e.state === this.PersonModel.store.STATE.ERROR ) {
      this.isFetching = false;
      if ( e.error.payload && e.error.payload.response && e.error.payload.response.status == 404) {
        this.results = [];
        if ( !this.hideResults ){
          this.page = 'results';
        }
      } else {
        this.wasError = true;
      }
    }
  }

  /**
   * @description Attached to click listeners on results page
   * @param {Number} id - IAM ID
   * @returns 
   */
  async _onPersonClick(id){
    if ( !this.isFetching ) {
      this.selectedPersonId = id;
      this.PersonModel.getPersonById(id, 'iamId', 'select');
    }
  }

}

customElements.define('ucdlib-iam-search', UcdlibIamSearch);