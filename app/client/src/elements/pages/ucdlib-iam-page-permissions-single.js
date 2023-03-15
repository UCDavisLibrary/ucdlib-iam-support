import { LitElement } from 'lit';
import {render} from "./ucdlib-iam-page-permissions-single.tpl.js";

/**
 * @classdesc Page for displaying a single permissions request form
 */
export default class UcdlibIamPagePermissionsSingle extends window.Mixin(LitElement)
  .with(window.LitCorkUtils) {

  static get properties() {
    return {
      formType: {type: String}
    };
  }

  constructor() {
    super();
    this.render = render.bind(this);

    this.formTypes = {
      'onboarding': {title: 'Permissions for New Employee'}
    };
    this.formType = 'onboarding';

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
    if ( !Object.keys(this.formTypes).includes(e.location.path[1]) ){
      requestAnimationFrame(() => this.AppStateModel.showError('This page does not exist!'));
      return;
    }
    this.formType = e.location.path[1];
    console.log(this.formTypes[this.formType].title);
    this.AppStateModel.setTitle({text: this.formTypes[this.formType].title, show: true});
  }

}

customElements.define('ucdlib-iam-page-permissions-single', UcdlibIamPagePermissionsSingle);