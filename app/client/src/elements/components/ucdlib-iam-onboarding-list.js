import { LitElement } from 'lit';
import {render} from "./ucdlib-iam-onboarding-list.tpl.js";

/**
 * @description Component for rendering a list of onboarding requests
 * Performs query based on attribute values.
 * Either on change with 'auto-update' attribute, or manually with doQuery method
 */
export default class UcdlibIamOnboardingList extends window.Mixin(LitElement)
  .with(window.LitCorkUtils)  {

  static get properties() {
    return {
      autoUpdate: {type: Boolean, attribute: 'auto-update'},
      panelTitle: {type: String, attribute: 'panel-title'},
      panelIcon: {type: String, attribute: 'panel-icon'},
      brandColor: {type: String, attribute: 'brand-color'},
      noResultsMessage: {Type: String, attribute: 'no-results-message'},
      statusId: {type: Number, attribute: 'status-id'},
      openStatus: {type: String, attribute: 'open-status'},
      iamId: {type: String, attribute: 'iam-id'},
      rtTicketId: {type: String, attribute: 'rt-ticket-id'},
      supervisorId: {type: String, attribute: 'supervisor-id'},
      _query: {state: true},
      _records: {state: true}
    };
  }

  constructor() {
    super();
    this.render = render.bind(this);
    this._injectModel('OnboardingModel');

    // view settings
    this.panelTitle = 'Onboarding Requests';
    this.panelIcon = 'fa-file-signature';
    this.brandColor = 'quad';
    this.noResultsMessage = 'There are no onboarding requests at this time.';

    // query settings
    this.autoUpdate = false;
    this.statusId = 0;
    this.openStatus = '';
    this.iamId = '';
    this.rtTicketId = '';
    this.supervisorId = '';
    this._queryProps = ['statusId', 'openStatus', 'iamId', 'rtTicketId', 'supervisorId'];

    // internal state
    this._records = [];
    this._query = {};
  }

  /**
   * @description Disables the shadowdom
   * @returns 
   */
  createRenderRoot() {
    return this;
  }

  /**
   * @description Attached to OnboardingModel onboarding-query event
   * @param {Object} e cork-app-utils event
   */
  _onOnboardingQuery(e){
    if ( e.state === 'loaded' && e.queryId === this.OnboardingModel.makeQueryString(this._query)){
      this._records = e.payload;
    }
  }

  /**
   * @description Lit lifecycle method
   * @param {*} props - Changed properties
   */
  willUpdate(props){
    if ( this.autoUpdate ) {
      let doQuery = false;
      this._queryProps.forEach(p => {
        if ( props.has(p) ) doQuery = true;
      });
      if ( doQuery ){
        this.doQuery();
      }
    }
  }

  /**
   * @description Retrieves onboarding requesting based on element attributes, updates view.
   * @param {Boolean} ignoreCache - Will not use cache if it exists.
   * @param {query} query - Manually set query instead of doing 
   */
  async doQuery(ignoreCache, query){
    let q = {};
    if ( query ) {
      q = query;
    } else {
      this._queryProps.forEach(p => {
        if ( p != 'openStatus' && this[p] ) q[p] = this[p];
      });
      if ( this.openStatus ){
        q['isOpen'] = this.openStatus == 'open';
      }
    }
    this._query = q;

    if ( ignoreCache ){
      this.OnboardingModel.clearQueryCache(q);
    }
    console.log(q);
    return await this.OnboardingModel.query(q);
  }

  /**
   * @description Formats a date
   * @param {String} d - ISO String
   * @returns {String}
   */
  fmtDate(d){
    try {
      d = new Date(d);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${months[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
    } catch (error) {
      return '';
    }
  }

}

customElements.define('ucdlib-iam-onboarding-list', UcdlibIamOnboardingList);