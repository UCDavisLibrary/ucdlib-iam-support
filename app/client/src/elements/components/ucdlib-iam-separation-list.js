import { LitElement } from 'lit';
import {render} from "./ucdlib-iam-separation-list.tpl.js";
import { LitCorkUtils, Mixin } from '@ucd-lib/cork-app-utils';

/**
 * @description Component for rendering a list of Separation requests
 * Performs query based on attribute values.
 * Either on change with 'auto-update' attribute, or manually with doQuery method
 */
export default class UcdlibIamSeparationList extends Mixin(LitElement)
  .with(LitCorkUtils)  {

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
    this._injectModel('SeparationModel');

    // view settings
    this.panelTitle = 'Separation Requests';
    this.panelIcon = 'fa-file-signature';
    this.brandColor = 'quad';
    this.noResultsMessage = 'There are no separation requests at this time.';

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
   * @description Attached to SeparationModel separation-query event
   * @param {Object} e cork-app-utils event
   */
  _onSeparationQuery(e){
    if ( e.state === 'loaded' && e.queryId === this.SeparationModel.makeQueryString(this._query)){
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
   * @description Retrieves separation requesting based on element attributes, updates view.
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
      this.SeparationModel.clearQueryCache(q);
    }
    return await this.SeparationModel.query(q);
  }


}

customElements.define('ucdlib-iam-separation-list', UcdlibIamSeparationList);
