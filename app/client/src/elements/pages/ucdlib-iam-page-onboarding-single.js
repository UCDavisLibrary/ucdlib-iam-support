import { LitElement } from 'lit';
import {render} from "./ucdlib-iam-page-onboarding-single.tpl.js";

/**
 * @description Page element for displaying a single onboarding request
 */
export default class UcdlibIamPageOnboardingSingle extends window.Mixin(LitElement)
  .with(window.LitCorkUtils) {

  static get properties() {
    return {
      requestId: {state: true},
      request: {state: true},
      firstName: {state: true},
      lastName: {state: true}
    };
  }

  constructor() {
    super();
    this.render = render.bind(this);
    this.requestId = '';
    this.request = {};
    this.firstName = '';
    this.lastName = '';

    this._injectModel('AppStateModel', 'OnboardingModel');
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
    this.AppStateModel.showLoading();
    this.requestId = e.location.path[1];
    const data = await this.OnboardingModel.getById(this.requestId);
    if ( data.state == 'loaded'){
      await this._setStateProperties(data.payload);
      this.AppStateModel.setTitle({show: true, text: this.pageTitle()});
      this.AppStateModel.setBreadcrumbs({show: true, breadcrumbs: this.breadcrumbs()});
      this.AppStateModel.showLoaded(this.id);
    } else if ( data.state == 'error' ){
      let msg = 'Unable to display onboarding request';
      if ( data.error && data.error.payload && data.error.payload.message ) msg = data.error.payload.message;
      this.AppStateModel.showError(msg);
    }
  }

  /**
   * @description Sets element state properties from onboarding request api payload
   * @param {Object} payload from /api/onboarding/id:
   */
  async _setStateProperties(payload){
    this.request = payload;
    this.firstName = payload.additionalData.employeeFirstName || '';
    this.lastName = payload.additionalData.employeeLastName || '';
  }

  /**
   * @description Returns title for page header and breadcrumbs
   * @returns {String}
   */
  pageTitle(){
    if ( this.firstName && this.lastName ) {
      return `${this.firstName} ${this.lastName}`;
    }
    return `Request ${this.requestId}`;
  }

  /**
   * @description Returns breadcrumbs for this page
   * @returns {Array}
   */
  breadcrumbs(){
    return [
      this.AppStateModel.store.breadcrumbs.home,
      this.AppStateModel.store.breadcrumbs.onboarding,
      {text: this.pageTitle(), link: ''}
    ];
  }

}

customElements.define('ucdlib-iam-page-onboarding-single', UcdlibIamPageOnboardingSingle);