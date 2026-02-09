import { LitElement } from 'lit';
import {render} from "./ucdlib-iam-alert.tpl.js";

import { LitCorkUtils, Mixin } from '@ucd-lib/cork-app-utils';

/**
 * @description Component for temporarily displaying a site alert
 */
export default class UcdlibIamAlert extends Mixin(LitElement)
  .with(LitCorkUtils) {

  static get properties() {
    return {
      hidden: {type: Boolean},
      message: {type: String},
      brandColor: {type: String}
    };
  }

  constructor() {
    super();
    this.render = render.bind(this);
    this.hidden = true;
    this.message = '';
    this.brandColor = '';

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
   * @description Attached to AppStateModel app-state-update event
   */
  _onAppStateUpdate(){
    this.hidden = true;
  }

  /**
   * @description Attached to AppStateModel alert-banner-update event
   * @param {Object} options
   */
  _onAlertBannerUpdate(options){
    if ( !options.message ) return;
    setTimeout(() => {
      this.message = options.message;
      this.brandColor = options.brandColor || '';

      this.hidden = false;
    }, options.timeout || 200);

  }

}

customElements.define('ucdlib-iam-alert', UcdlibIamAlert);
