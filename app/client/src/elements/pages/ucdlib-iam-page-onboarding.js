import { LitElement } from 'lit';
import {render} from "./ucdlib-iam-page-onboarding.tpl.js";

import "../components/ucdlib-iam-onboarding-list";

/**
 * @classdesc Lists active onboarding requests and provides navigation to additional onboarding actions
 */
export default class UcdlibIamPageOnboarding extends window.Mixin(LitElement)
  .with(window.LitCorkUtils) {
  static get properties() {
    return {
      
    };
  }

  constructor() {
    super();
    this.render = render.bind(this);

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

customElements.define('ucdlib-iam-page-onboarding', UcdlibIamPageOnboarding);