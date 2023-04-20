import { LitElement } from 'lit';
import {render} from "./ucdlib-iam-page-permissions.tpl.js";

/**
 * @classdesc TODO: Page that displays options for requesting permissions
 * Allows user to pick if is for
 * - themselves
 * - one of their employees
 * - someone else (does not have to be employee list)
 * 
 * And then can pick specific permissions wants to update
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