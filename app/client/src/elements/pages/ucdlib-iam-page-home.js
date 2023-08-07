import { LitElement } from 'lit';
import {render} from "./ucdlib-iam-page-home.tpl.js";
import "../components/ucdlib-org-chart";

/**
 * @classdesc Xomponent for displaying the application home page
 */
export default class UcdlibIamPageHome extends window.Mixin(LitElement)
  .with(window.LitCorkUtils) {

  static get properties() {
    return {

    };
  }

  constructor() {
    super();
    this.render = render.bind(this);
    this.colors = {
      hr: 'arboretum',
      supervisors: 'redwood',
      employees: 'redbud'
    };

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
    if ( e.page != this.id ) return;
    this.AppStateModel.showLoaded(this.id);
  }

}

customElements.define('ucdlib-iam-page-home', UcdlibIamPageHome);
