import { LitElement } from 'lit';
import {render} from "./ucdlib-employee-search.tpl.js";


/**
 * @classdesc Element for searching for library employees
 * Uses local database, not UCD IAM API
 */
export default class UcdlibEmployeeSearch extends window.Mixin(LitElement)
  .with(window.LitCorkUtils) {

  static get properties() {
    return {
      name: {type: String},
      results: {state: true},
      totalResults: {state: true},
      error: {state: true}
    };
  }

  willUpdate(p) {
    if ( p.has('name') ){
      if ( this.searchTimeout ) clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.search();
      }, 500);
    }
  }

  constructor() {
    super();
    this.render = render.bind(this);
    this.name = '';
    this.results = [];
    this.totalResults = 0;
    this.error = false;

    this._injectModel('EmployeeModel');
  }

  /**
   * @description Disables the shadowdom
   * @returns
  */
  createRenderRoot() {
    return this;
  }

  async search(){
    if ( !this.name ) {
      this.results = [];
      this.totalResults = 0;
      this.error = false;
      return;
    }
    const r = await this.EmployeeModel.searchByName(this.name);
    if ( r.state === 'loaded' ) {
      console.log(r.payload);
      this.results = r.payload.results;
      this.totalResults = r.payload.total;
      this.error = false;
    }
    if ( r.state === 'error' ) {
      this.error = true;
    }
  }

}

customElements.define('ucdlib-employee-search', UcdlibEmployeeSearch);
