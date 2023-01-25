import { LitElement } from 'lit';
import {render} from "./ucdlib-iam-app.tpl.js";

// global event bus and model registry
import "@ucd-lib/cork-app-utils";
import "../models";

/**
 * @description The main custom element
 * Handles application-level stuff, such as routing.
 */
export default class UcdlibIamApp extends window.Mixin(LitElement)
  .with(window.LitCorkUtils) {

  static get properties() {
    return {
      page: {type: String}
    };
  }

  constructor() {
    super();
    this.render = render.bind(this);
    this.page = 'loading';
    this._injectModel('AppStateModel');
  }
  

  /**
   * @description Disables the shadowdom
   * @returns 
   */
  createRenderRoot() {
    return this;
  }

  /**
   * @method _onAppStateUpdate
   * @description bound to AppStateModel app-state-update event
   *
   * @param {Object} e
   */
  async _onAppStateUpdate(e) {
    console.log(e);
  }

}

customElements.define('ucdlib-iam-app', UcdlibIamApp);