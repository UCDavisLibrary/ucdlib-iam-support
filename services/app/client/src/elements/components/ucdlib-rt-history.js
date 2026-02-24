import { LitElement } from 'lit';
import {render} from "./ucdlib-rt-history.tpl.js";
import { LitCorkUtils, Mixin } from '@ucd-lib/cork-app-utils';

import { AppComponentController } from '#controllers';

/**
 * @classdesc Element for displaying the history of an RT ticket
 */
export default class UcdlibRtHistory extends Mixin(LitElement)
  .with(LitCorkUtils)  {

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

    this.ctl = {
      appComponent : new AppComponentController(this),
    }

    this._injectModel('RtModel', 'AppStateModel');
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
      this.getTicketHistory();
    }
  }

  _onAppStateUpdate() {
    if ( !this.ctl.appComponent.isOnActivePage ) return;
    if ( !this.ticketId ) return;
    this.getTicketHistory();
  }

  async getTicketHistory(){
    if ( !this.ticketId ) {
      this.transactions = [];
      return;
    }
    const r = await this.RtModel.getTicketHistory(this.ticketId);
    if ( r.state !== 'loaded' ) return;
    this.transactions = this.RtModel.formatHistory(r.payload.items);
  }

}

customElements.define('ucdlib-rt-history', UcdlibRtHistory);
