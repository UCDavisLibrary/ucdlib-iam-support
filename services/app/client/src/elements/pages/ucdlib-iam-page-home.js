import { LitElement } from 'lit';
import {render} from "./ucdlib-iam-page-home.tpl.js";
import { LitCorkUtils, Mixin } from '@ucd-lib/cork-app-utils';

import { AppComponentController } from '#controllers';

/**
 * @classdesc Component for displaying the application home page
 */
export default class UcdlibIamPageHome extends Mixin(LitElement)
  .with(LitCorkUtils) {

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

customElements.define('ucdlib-iam-page-home', UcdlibIamPageHome);
