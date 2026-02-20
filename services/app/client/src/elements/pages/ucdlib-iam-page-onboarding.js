import { LitElement } from 'lit';
import {render} from "./ucdlib-iam-page-onboarding.tpl.js";
import { LitCorkUtils, Mixin } from '@ucd-lib/cork-app-utils';

import { AppComponentController } from '#controllers';

import "#components/ucdlib-iam-onboarding-list.js";
import "#components/ucdlib-iam-existing-search.js";
import "#components/ucdlib-iam-modal.js";

/**
 * @classdesc Lists active onboarding requests and provides navigation to additional onboarding actions
 */
export default class UcdlibIamPageOnboarding extends Mixin(LitElement)
  .with(LitCorkUtils) {
  static get properties() {
    return {
      canViewAll: {state: true},
      tabView: {state: true},
      userIamId: {state: true}
    };
  }

  constructor() {
    super();
    this.render = render.bind(this);

    this._injectModel('AppStateModel', 'OnboardingModel', 'AuthModel');

    this.activeId = 'ob-list-active';
    this.recentId = 'ob-list-recent';
    this.supervisorId = 'ob-list-supervisor';
    this.canViewAll = false;
    this.userIamId = '';
    this.tabView = 'active'; // active or recent

    this.ctl = {
      appComponent : new AppComponentController(this),
    }
  }

  /**
   * @description Disables the shadowdom
   * @returns
   */
  createRenderRoot() {
    return this;
  }

  /**
   * @description Attached to OnboardingModel onboarding-query-update event
   * @param {Object} e cork-app-utils event
   */
  _onOnboardingQueryUpdate(e){
    if ( !this.ctl.appComponent.isOnActivePage ) return;
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
    if ( !this.ctl.appComponent.isOnActivePage ) return;
    this.AppStateModel.showLoading();
    await this._getRequiredPageData();
    this.ctl.appComponent.showPage();
  }

  /**
   * @method _onTokenRefreshed
   * @description bound to AuthModel token-refreshed event
   * @param {AccessToken} token
   */
  _onTokenRefreshed(token){
    this.canViewAll = token.hasAdminAccess || token.hasHrAccess;
    this.userIamId = token.iamId;
    if ( this.ctl.appComponent.isOnActivePage ) this. _getRequiredPageData();
  }

  /**
   * @description Do data retrieval required to display a subpage
   */
  async _getRequiredPageData(){
    const activeListEle = this.querySelector(`#${this.activeId}`);
    const supervisorEle = this.querySelector(`#${this.supervisorId}`);
    const recentEle = this.querySelector(`#${this.recentId}`);
    if ( !activeListEle || !supervisorEle || !recentEle ) {
      return; // page not fully loaded yet. wait for next app-state-update.
    }
    const promises = [];
    if ( this.canViewAll ) {
      promises.push(activeListEle.doQuery());
      promises.push(recentEle.doQuery());
    }
    if ( this.userIamId ) promises.push(supervisorEle.doQuery({supervisorId: this.userIamId}));
    await new Promise(resolve => {requestAnimationFrame(resolve);});
  }

  showSearchModal(){
    const modal = this.querySelector('#ob-search');
    modal.show();
  }

  hideSearchModal(){
    const modal = this.querySelector('#ob-search');
    modal.hide();
  }

}

customElements.define('ucdlib-iam-page-onboarding', UcdlibIamPageOnboarding);
