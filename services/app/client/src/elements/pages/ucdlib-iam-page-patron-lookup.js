import { LitElement } from 'lit';
import * as Templates from "./ucdlib-iam-page-patron-lookup.tpl.js";
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
    this.informationHeader = "ID";

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
      this.selectedPersonProfile = new RosettaPerson(r.payload.results[0]);
      this.AppStateModel.setTitle({show: true, text: this.pageTitle()});
      this.AppStateModel.setBreadcrumbs({show: true, breadcrumbs: this.breadcrumbs()});

      const alma = await this.AlmaUserModel.getUserById(this.selectedPersonProfile?.userId);
      if(alma.error){
        this.alma = null;
        this.AppStateModel.showAlertBanner({message: 'There was an error when accessing the UC Davis Alma API. Some fields may be missing. Check with admin for further assistance.', brandColor: 'double-decker'});
      } else {
        this.alma = alma;
      }

      if(!this.alma?.id) this.alma = null;

      
      const ldap = await this.LdapModel.query({iamId: this.selectedPersonProfile?.id});
      if(ldap.error){
        this.ldap = null;
        this.AppStateModel.showAlertBanner({message: 'There was an error when accessing the UC Davis LDAP. Some fields may be missing. Check with admin for further assistance.', brandColor: 'double-decker'});
      } else {
        this.ldap = ldap?.id ? ldap?.payload?.[0] : null;
      }

      this.informationHeaderID = this.selectedPersonProfile?.id;
      this.page = 'information';
    } else if( r.state === this.RosettaModel.store.STATE.ERROR ) {
      this.isFetching = false;
      this.AppStateModel.showAlertBanner({message: 'There was an error when accessing the Rosetta API. Some fields may be missing. Check with admin for further assistance.', brandColor: 'double-decker'});
      this.wasError = true;
    }

    if ( this.resetOnSelect ) this.reset();
  }

  /**
   * @description Attached to rosetta-person-selected event from rosetta-person-search element
   * @param {RosettaPerson} person data object for the selected person
   * @returns
   */
  async _onEmployeeSelect(person){
    this.AppStateModel.setLocation('/patron?iamid=' + person.id);
  }

  /**
   * @description Returns a formatted title for the given affiliation
   * @param {Array} affiliation - An array containing a single string representing the affiliation
   * @returns {String} - A formatted title for the affiliation
   */
  getAffiliationTitle(affiliation){
    const str = affiliation[0];
    const acronyms = ['USDA', 'WHNRC', 'CPE', 'UCD', 'UC', 'UCDHS', 'UCANR', 'COSMOS'];
    const acronymSet = new Set(acronyms.map(a => a.toLowerCase()));
    let title = str
        .split('_')
        .map(word => {
          const lowerWord = word.toLowerCase();
          
          // words that are in the acronym list should be fully capitalized
          if (acronymSet.has(lowerWord)) {
            return word.toUpperCase();
          }
          
          // capitalize the first letter of the word and make the rest lowercase
          return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        })
        .join(' ');

      
    return `Is ${title}`;
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
    if ( this.selectedPersonProfile?.fullName ) {
      return `${this.selectedPersonProfile.fullName}`;
    }
    else if ( this.selectedPersonProfile?.firstName && this.selectedPersonProfile?.lastName ) {
      return `${this.selectedPersonProfile.firstName} ${this.selectedPersonProfile.lastName}`;
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
