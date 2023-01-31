import { LitElement } from 'lit';
import {render} from "./ucdlib-iam-app.tpl.js";

// global event bus and model registry
import "@ucd-lib/cork-app-utils";
import "../models";

// components
import "./components/ucdlib-iam-search";

/**
 * @description The main custom element
 * Handles application-level stuff, such as routing.
 */
export default class UcdlibIamApp extends window.Mixin(LitElement)
  .with(window.LitCorkUtils) {

  static get properties() {
    return {
      page: {type: String},
      showPageTitle: {type: Boolean},
      pageTitle: {type: String},
      showBreadcrumbs: {type: Boolean},
      breadcrumbs: {type: Array}
    };
  }

  constructor() {
    super();
    this.render = render.bind(this);

    this.page = 'loading';
    this.showPageTitle = false;
    this.pageTitle = '';
    this.showBreadcrumbs = false;
    this.breadcrumbs = [];

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
    this.showPageTitle = e.title.show;
    this.pageTitle = e.title.text;
    this.showBreadcrumbs = e.breadcrumbs.show;
    this.breadcrumbs = e.breadcrumbs.breadcrumbs;
    console.log(e);
  }

}

customElements.define('ucdlib-iam-app', UcdlibIamApp);