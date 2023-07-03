import { LitElement } from 'lit';
import * as Templates from "./ucdlib-iam-existing-search.tpl.js";

/**
 * @description Component element for querying the UC Davis IAM Onboarding API
 */
export default class UcdlibIamExistingSearch extends window.Mixin(LitElement)
  .with(window.LitCorkUtils) {

  static get properties() {
    return {
      onboarding: {type: Boolean, attribute: 'onboarding'},
      searchParam: {type: String, attribute: 'search-param'},
      widgetTitle: {type: String, attribute: 'widget-title'},
      hideNav: {type: Boolean, attribute: 'hide-nav'},
      hideNavOptions: {type: String, attribute: 'hide-nav-options'},
      firstName: {type: String, attribute: 'first-name'},
      lastName: {type: String, attribute: 'last-name'},
      hideResults: {type: Boolean, attribute: 'hide-results'},
      resetOnSelect: {type: Boolean, attribute: 'reset-on-select'},
      searchParams: {state: true},
      navItems: {state: true},
      disableSearch: {state: true},
      isFetching: {state: true},
      wasError: {state: true},
      errorText: {state: true},
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
    this.renderNameForm = Templates.renderNameForm.bind(this);

    this._injectModel('PersonModel', "OnboardingModel", "SeparationModel");
    this.onboarding = false;
    this.navItems = [];
    this.searchParams = [
      {
        attribute: 'name',
        key: 'name',
        label: 'Name',
        requiredProps: ['firstName', 'lastName']
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

    this.reset();
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
   * @description Resets element
   */
  reset(){
    this.firstName = '';
    this.lastName = '';

    this.isFetching = false;
    this.wasError = false;
    this.page = 'form';
    this.hideResults = false;
    this.results = [];
    this.selectedPersonId = '';
    this.selectedPersonProfile = {};
    this.errorText = 'An error has occurred. Please try again later.';
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

    let q = {};

    q.firstName = this.firstName;
    q.lastName = this.lastName;

    this.widgetTitle = this.onboarding ? 'UC Davis Onboarding Search': 'UC Davis Separation Search';
    this.resultLabel = this.onboarding ? 'Onboarding': 'Separation';
    let r = this.onboarding ? await this.OnboardingModel.recordSearch(q) : await this.SeparationModel.recordSearch(q);
    let error = this.onboarding ? this.OnboardingModel.store.STATE.ERROR : this.SeparationModel.store.STATE.ERROR;
    let loaded = this.onboarding ? this.OnboardingModel.store.STATE.LOADED : this.SeparationModel.store.STATE.LOADED;
    console.log(r);
    this.link = this.onboarding ? "/onboarding/" : "/separation/";
    if ( r.state === loaded ) {
      this.isFetching = false;
      this.results = Array.isArray(r.payload) ? r.payload : [r.payload];
      if ( !this.hideResults ){
        this.page = 'results';
      }
    } else if( r.state === error ) {
      this.isFetching = false;
      if ( r.error?.response?.status == 404) {
        this.results = [];
        if ( !this.hideResults ){
          this.page = 'results';
        }
      } else {
        this.wasError = true;
      }
    }


    if(this.onboarding) this.dispatchEvent(new CustomEvent('onboarding-search', {detail: {status: r}}));
    else this.dispatchEvent(new CustomEvent('separation-search', {detail: {status: r}}));
    
    

    

  }

 /**
   * @description Attached to submit event on element form
   * @param {*} result - Submit result
   */
  _onSelect(result){
    this.reset();
    if(this.onboarding) this.dispatchEvent(new CustomEvent('onboarding-select', {detail: {record: result}}));
    else this.dispatchEvent(new CustomEvent('separation-select', {detail: {record: result}}));

  }

}

customElements.define('ucdlib-iam-existing-search', UcdlibIamExistingSearch);
