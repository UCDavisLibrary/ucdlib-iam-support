import { LitElement } from 'lit';
import {render} from "./ucdlib-iam-onboarding-list.tpl.js";

/**
 * @description Component for rendering a list of onboarding requests
 */
export default class UcdlibIamOnboardingList extends window.Mixin(LitElement)
  .with(window.LitCorkUtils)  {

  static get properties() {
    return {
      autoUpdate: {type: Boolean, attribute: 'auto-update'},
      panelTitle: {type: String, attribute: 'panel-title'},
      panelIcon: {type: String, attribute: 'panel-icon'},
      brandColor: {type: String, attribute: 'brand-color'}
    };
  }

  constructor() {
    super();
    this.render = render.bind(this);
    this._injectModel('OnboardingModel');

    this.autoUpdate = false;
    this.panelTitle = 'Onboarding Requests';
    this.panelIcon = 'fa-file-signature';
    this.brandColor = 'quad';
  }

  /**
   * @description Disables the shadowdom
   * @returns 
   */
  createRenderRoot() {
    return this;
  }

}

customElements.define('ucdlib-iam-onboarding-list', UcdlibIamOnboardingList);