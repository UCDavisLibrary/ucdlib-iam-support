import { LitElement } from 'lit';
import {render} from "./ucdlib-iam-page-onboarding.tpl.js";

import "../components/ucdlib-iam-onboarding-list";
import "../components/ucdlib-iam-onboarding-search";
/**
 * @classdesc Lists active onboarding requests and provides navigation to additional onboarding actions
 */
export default class UcdlibIamPageOnboarding extends window.Mixin(LitElement)
  .with(window.LitCorkUtils) {
  static get properties() {
    return {
      canViewActiveList: {state: true},
      userIamId: {state: true}
    };
  }

  constructor() {
    super();
    this.render = render.bind(this);

    this._injectModel('AppStateModel', 'OnboardingModel', 'AuthModel');

    this.activeId = 'ob-list-active';
    this.supervisorId = 'ob-list-supervisor';
    this.canViewActiveList = false;
    this.userIamId = '';
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
   * @method _onTokenRefreshed
   * @description bound to AuthModel token-refreshed event
   * @param {AccessToken} token 
   */
  _onTokenRefreshed(token){
    this.canViewActiveList = token.hasAdminAccess || token.hasHrAccess;
    this.userIamId = token.iamId;
    if ( this.AppStateModel.currentPage == this.id ) this. _getRequiredPageData();
  }

  /**
   * @description Do data retrieval required to display a subpage
   */
  async _getRequiredPageData(){
    const activeListEle = this.querySelector(`#${this.activeId}`);
    const supervisorEle = this.querySelector(`#${this.supervisorId}`);
    if ( !activeListEle || !supervisorEle ){
      return; // page not fully loaded yet. wait for next app-state-update.
    }
    const promises = [];
    if ( this.canViewActiveList ) promises.push(activeListEle.doQuery());
    if ( this.userIamId ) promises.push(supervisorEle.doQuery(false, {supervisorId: this.userIamId}));
    await new Promise(resolve => {requestAnimationFrame(resolve);});
  }

}

customElements.define('ucdlib-iam-page-onboarding', UcdlibIamPageOnboarding);