import { LitElement } from 'lit';
import {render} from "./ucdlib-iam-page-home.tpl.js";

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
      supervisors: 'merlot',
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

}

customElements.define('ucdlib-iam-page-home', UcdlibIamPageHome);