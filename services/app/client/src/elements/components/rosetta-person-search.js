import { LitElement } from 'lit';
import { render } from "./rosetta-person-search.tpl.js";

import { LitCorkUtils, Mixin } from '@ucd-lib/cork-app-utils';
import { MainDomElement } from "@ucd-lib/theme-elements/utils/mixins/main-dom-element.js"

import IdGenerator from '../../utils/IdGenerator.js';
import { AppComponentController } from '#controllers';
import RosettaPerson from '#lib/utils/RosettaPerson.js';

/**
 * @description A search widget for looking up UC Davis affiliates via the Rosetta API, either
 * by unique identifier (email, login id, employee id, student id, iam id) or by name. Displays
 * results and fires a 'rosetta-person-selected' event when one is clicked.
 * @fires rosetta-person-selected - Fired when a search result is clicked. detail: {person: Object} - the raw Rosetta person data
 * @property {String} heading - Heading text displayed above the search form
 * @property {Boolean} noHeading - If true, hides the heading
 * @property {Boolean} noResetOnAppStateUpdate - If true, the search form/results are not reset on app-state-update events
 */
export default class RosettaPersonSearch extends Mixin(LitElement)
  .with(LitCorkUtils, MainDomElement) {

  static get properties() {
    return {
      heading: {type: String},
      noHeading: {type: Boolean, attribute: 'no-heading'},
      noResetOnAppStateUpdate: {type: Boolean, attribute: 'no-reset-on-app-state-update'},
      query: { state: true },
      results: { state: true },
      totalResults: { state: true },
      isSearching: { state: true },
      isError: { state: true },
      errorMessage: { state: true },
      selected: { state: true },
      showResults: {state: true }
    }
  }

  constructor() {
    super();
    this.render = render.bind(this);

    this.idGen = new IdGenerator();
    this.ctl = {
      appComponent : new AppComponentController(this),
    }
    this.reset();
    this.heading = 'Search UC Davis Affilates';
    this.noHeading = false;
    this.noResetOnAppStateUpdate = false;

    this.idTypes = [
      { id: 'email', label: 'Email' },
      { id: 'loginid', label: 'Login ID (Kerberos)' },
      { id: 'employeeid', label: 'Employee ID' },
      { id: 'studentid', label: 'Student ID' },
      { id: 'iamid', label: 'IAM ID' },
      { id: 'name', label: 'Name' }
    ];

    this._injectModel('AppStateModel', 'RosettaModel');
  }

  /**
   * @method _onAppStateUpdate
   * @description bound to AppStateModel app-state-update event. Resets the search form/results
   * when this component's page becomes active, unless noResetOnAppStateUpdate is set.
   */
  _onAppStateUpdate() {
    if ( !this.ctl.appComponent.isOnActivePage ) return;
    if ( this.noResetOnAppStateUpdate ) return;
    this.reset();
  }

  /**
   * @description Resets the search form and results to their initial state
   */
  reset() {
    this.query = {};
    this.results = [];
    this.totalResults = 0;
    this.isSearching = false;
    this.isError = false;
    this.errorMessage = '';
    this.selected = null;
    this.showResults = false;
  }

  /**
   * @description Submits the search form - validates the required fields for the selected
   * search method, then queries Rosetta by name or by unique identifier
   * @param {SubmitEvent} e
   */
  async _onSubmit(e){
    e.preventDefault();
    this.isError = false;
    this.errorMessage = '';
    this.showResults = false;

    if ( !this.query.idType ){
      this.showError('Please select a search method');
      return;
    }
    const query = {...this.query};
    if ( this.query.idType === 'name' ){
      if ( !this.query.firstName && !this.query.lastName ){
        this.showError('Please provide a first name and/or last name to search');
        return;
      }
      delete query.idType;
    } else {
      if ( !this.query.id ){
        this.showError('Please provide an identifier to search');
        return;
      }
    }

    this.isSearching = true;
    this.results = [];
    this.totalResults = 0;
    let r;
    if ( this.query.idType === 'name' ){
      r = await this.RosettaModel.getPersonByName(query);
    } else {
      r = await this.RosettaModel.getPersonById(query.id, query.idType);
    }
    this.isSearching = false;
    if ( r.state === 'error' ){
      this.showError('An error occurred while searching. Please try again later.');
      return;
    }
    this.totalResults = parseInt(r.payload.totalCount || 0);
    this.results = r.payload.results.map( p => new RosettaPerson(p) );
    this.showResults = true;
    await this.updateComplete;
    this.querySelector('.rosetta-person-results')?.scrollTo(0, 0);
  }

  /**
   * @description Bound to search form inputs. Updates the query object; selecting a new idType
   * resets the rest of the query since fields differ by search method.
   * @param {String} prop - Query property being updated (e.g. 'idType', 'id', 'firstName', 'lastName')
   * @param {*} value - New value for the property
   */
  _onInputChange(prop, value){
    if ( prop === 'idType' ){
      this.query = {idType: value};
    } else {
      this.query[prop] = value;
      this.requestUpdate();
    }
  }

  /**
   * @description Bound to a search result click. Sets the selected person and dispatches a
   * rosetta-person-selected event
   * @param {RosettaPerson} person - The selected search result
   * @fires rosetta-person-selected - detail: {person: Object} - RosettaPerson class instance for the selected person
   */
  _onPersonClick(person){
    this.selected = person;
    this.dispatchEvent(new CustomEvent('rosetta-person-selected', {detail: {person}}));
  }

  /**
   * @description Starts a new search, preserving the currently selected idType
   */
  _onNewSearchClick(){
    const idType = this.query.idType;
    this.reset();
    this.query.idType = idType;
    this.requestUpdate();
  }

  /**
   * @description Displays an error message and moves focus to it for accessibility
   * @param {String} message - Error message to display
   */
  async showError(message){
    this.isError = true;
    this.errorMessage = message;
    await this.updateComplete;
    this.querySelector(`#${this.idGen.get('error')}`).focus();
  }

}

customElements.define('rosetta-person-search', RosettaPersonSearch);