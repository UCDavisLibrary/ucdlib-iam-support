import { LitElement } from 'lit';
import {render} from "./ucdlib-rt-history.tpl.js";

/**
 * @classdesc Element for displaying the history of an RT ticket
 */
export default class UcdlibRtHistory extends window.Mixin(LitElement)
  .with(window.LitCorkUtils)  {

  static get properties() {
    return {
      ticketId: {type: String, attribute: 'ticket-id'},
      transactions: {state: true}
    };
  }

  constructor() {
    super();
    this.render = render.bind(this);

    this.ticketId = '';
    this.transactions = [];

    this._injectModel('RtModel');
  }

  /**
   * @description Disables the shadowdom
   * @returns
   */
  createRenderRoot() {
    return this;
  }

  /**
   * @description Lit lifecycle method that is called when the element will update
   * @param {Map} p - changed properties
   */
  async willUpdate(p) {
    if ( p.has('ticketId') ) {
      if ( !this.ticketId ){
        this.transactions = [];
      } else {
        const alreadyRequested = this.RtModel.store.data.history[this.ticketId];
        if ( alreadyRequested && alreadyRequested.state === 'loading' ) await alreadyRequested.state;
        if ( alreadyRequested && alreadyRequested.state === 'loaded' ) {
          this.transactions = this.RtModel.formatHistory(alreadyRequested.payload.items);
        }
      }
    }
  }

  /**
   * @description Listens to RT_TICKET_HISTORY_REQUEST events and updates transactions if the ticket id matches
   * @param {*} e
   * @returns
   */
  _onRtTicketHistoryRequest(e) {
    if ( e.id !== this.ticketId ) return;
    if ( e.state === 'loaded' ) {
      this.transactions = this.RtModel.formatHistory(e.payload.items);
    } else {
      this.transactions = [];
    }
  }

}

customElements.define('ucdlib-rt-history', UcdlibRtHistory);
