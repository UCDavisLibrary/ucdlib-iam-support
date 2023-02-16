import { LitElement } from 'lit';
import {render} from "./ucdlib-iam-page-onboarding-single.tpl.js";

/**
 * @description Page element for displaying a single onboarding request
 */
export default class UcdlibIamPageOnboardingSingle extends window.Mixin(LitElement)
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

customElements.define('ucdlib-iam-page-onboarding-single', UcdlibIamPageOnboardingSingle);