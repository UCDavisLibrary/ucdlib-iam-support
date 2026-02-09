import { LitElement, html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import {render} from "./ucdlib-employee-search.tpl.js";

import { LitCorkUtils, Mixin } from '@ucd-lib/cork-app-utils';

/**
 * @classdesc Element for searching for library employees
 * Uses local database, not UCD IAM API
 */
export default class UcdlibEmployeeSearch extends Mixin(LitElement)
  .with(LitCorkUtils) {

  static get properties() {
    return {
      query: {type: String},
      labelText: {type: String, attribute: 'label-text'},
      hideLabel: {type: Boolean, attribute: 'hide-label'},
      results: {state: true},
      totalResults: {state: true},
      resultCtNotShown: {state: true},
      noResults: {state: true},
      error: {state: true},
      status: {state: true},
      isSearching: {state: true},
      showDropdown: {state: true},
      isFocused: {state: true},
      selectedText: {state: true},
      selectedObject: {state: true},
    };
  }

  constructor() {
    super();
    this.render = render.bind(this);
    this.query = '';
    this.results = [];
    this.totalResults = 0;
    this.resultCtNotShown = 0;
    this.error = false;
    this.labelText = 'Existing Employee Search';
    this.hideLabel = false;
    this.status = 'idle';
    this.isSearching = false;
    this.showDropdown = false;
    this.isFocused = false;
    this.noResults = false;
    this.selectedText = '';
    this.selectedObject = {};

    this._injectModel('EmployeeModel');
  }

  /**
   * @description LitElement lifecycle called when element is updated
   * @param {*} p - Changed properties
   */
  willUpdate(p) {
    if ( p.has('query') ){
      if ( this.searchTimeout ) clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.search();
      }, 500);
    }

    if ( p.has('results') || p.has('totalResults') ) {
      this.resultCtNotShown = this.totalResults - this.results.length;
    }

    this._setStatus(p);
    this._setShowDropdown(p);
  }

  /**
   * @description Disables the shadowdom
   * @returns
  */
  createRenderRoot() {
    return this;
  }

  /**
   * @description Searches for employees by name. Fires when query property changes.
   * @returns
   */
  async search(){
    this.noResults = false;
    this.selectedText = '';
    this.selectedObject = {};
    if ( !this.query ) {
      this.results = [];
      this.totalResults = 0;
      this.error = false;
      return;
    }
    this.isSearching = true;
    const r = await this.EmployeeModel.searchByName(this.query);
    this.isSearching = false;
    if ( r.state === 'loaded' ) {
      this.results = r.payload.results;
      this.totalResults = r.payload.total;
      this.noResults = !this.results.length;
      this.error = false;
    }
    if ( r.state === 'error' ) {
      this.error = true;
    }
  }

  /**
   * @description Sets the status of the element based on the updated properties
   * @param {*} p - Changed properties
   */
  _setStatus(p){
    if ( p.has('isSearching') || p.has('query') || p.has('noResults') || p.has('selectedText') ){
      const detail = {status: this.status};
      let status = 'idle';
      if ( this.isSearching ) {
        status = 'searching';
      } else if ( this.noResults ){
        status = 'no-results';
      } else if ( this.selectedText ){
        status = 'selected';
        detail.employee = this.selectedObject;
      }
      this.status = status;

      this.dispatchEvent(new CustomEvent('status-change', {
        detail: detail
      }));
    }

  }

  /**
   * @description Shows/hides the results dropdown based on the element's updated properties
   * @param {*} p
   */
  _setShowDropdown(p){
    if ( p.has('isFocused') || p.has('results') || p.has('query') || p.has('selectedText')){
      this.showDropdown = this.isFocused && this.results.length && this.query && !this.selectedText;
    }
  }

  /**
   * @description Renders a single result item in the results dropdown
   * @param {Object} result - an Employee object from the database
   * @returns {TemplateResult}
   */
  _renderResult(result){
    if ( !this.query) return html``;

    // highlight search term
    let name = `${result.firstName} ${result.lastName}`.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const queries = this.query.replace(/</g, '').replace(/>/g, '').split(' ').filter(q => q);
    for (let query of queries) {
      const regex = new RegExp(query, 'gi');
      name = name.replace(regex, (match) => `<${match}>`);
    }
    name = name.replace(/</g, '<span class="highlight">').replace(/>/g, '</span>');
    name=`<div>${name}</div>`;

    return html`
      ${unsafeHTML(name)}
      <div class='muted'>${result.title}</div>
    `;

  }

  /**
   * @description Fires when a result is clicked from the dropdown
   * @param {Object} result - an Employee object from the database
   */
  _onSelect(result){
    this.selectedText = `${result.firstName} ${result.lastName}`;
    this.selectedObject = result;
    this.dispatchEvent(new CustomEvent('select', {
      detail: {employee: result}
    }));
  }

  /**
   * @description Hides dropdown box on input blur.
   * Must give time for click event to fire on dropdown item.
   */
  _onBlur(){
    setTimeout(() => {
      this.isFocused = false;
    }, 250);
  }

}

customElements.define('ucdlib-employee-search', UcdlibEmployeeSearch);
