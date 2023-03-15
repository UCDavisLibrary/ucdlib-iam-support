import { LitElement } from 'lit';
import {render} from "./ucdlib-iam-page-permissions.tpl.js";

/**
 * @classdesc Page that displays options for requesting permissions
 */
export default class UcdlibIamPagePermissions extends window.Mixin(LitElement)
  .with(window.LitCorkUtils) {

  static get properties() {
    return {
      
    };
  }

  constructor() {
    super();
    this.render = render.bind(this);
  }

  /**
   * @description Disables the shadowdom
   * @returns 
   */
  createRenderRoot() {
    return this;
  }

}

customElements.define('ucdlib-iam-page-permissions', UcdlibIamPagePermissions);