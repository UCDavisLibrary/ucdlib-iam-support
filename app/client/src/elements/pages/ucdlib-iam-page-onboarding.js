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

    this._injectModel('AppStateModel', 'OnboardingModel');

    this.activeId = 'ob-list-active';
  }

  /**
   * @description Disables the shadowdom
   * @returns 
   */
  createRenderRoot() {
    return this;
  }

  /**
   * @description Attached to OnboardingModel onboarding-query event
   * @param {Object} e cork-app-utils event
   */
  _onOnboardingQuery(e){
    if ( e.state === 'error'){
      let msg = 'Unable to load onboarding requests';
      if ( e.error.details && e.error.details.message ){
        msg =  e.error.details.message;
      }
      this.AppStateModel.showError(msg);
    }
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
    await this._getRequiredPageData();
    this.AppStateModel.showLoaded(this.id);
  }

  /**
   * @description Do data retrieval required to display a subpage
   */
  async _getRequiredPageData(){
    const activeListEle = this.querySelector(`#${this.activeId}`);
    if ( !activeListEle ){
      return; // page not fully loaded yet. wait for next app-state-update.
    }
    const promises = [
      activeListEle.doQuery()
    ];
    await Promise.all(promises);
  }

}

customElements.define('ucdlib-iam-page-onboarding', UcdlibIamPageOnboarding);