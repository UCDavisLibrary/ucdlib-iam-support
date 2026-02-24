import { LitElement } from 'lit';
import {render} from "./ucdlib-iam-page-tools.tpl.js";
import { LitCorkUtils, Mixin } from '@ucd-lib/cork-app-utils';

import { AppComponentController } from '#controllers';

/**
 * @description Landing page for support tools
 */
export default class UcdlibIamPageTools extends Mixin(LitElement)
  .with(LitCorkUtils) {

  static get properties() {
    return {

    };
  }


  constructor() {
    super();
    this.render = render.bind(this);

    this.ctl = {
      appComponent : new AppComponentController(this),
    }

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
    if ( !this.ctl.appComponent.isOnActivePage ) return;
    this.ctl.appComponent.showPage();
  }

}

customElements.define('ucdlib-iam-page-tools', UcdlibIamPageTools);
