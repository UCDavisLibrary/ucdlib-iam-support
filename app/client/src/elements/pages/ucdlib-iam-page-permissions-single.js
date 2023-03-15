import { LitElement } from 'lit';
import {render} from "./ucdlib-iam-page-permissions-single.tpl.js";

/**
 * @classdesc Page for displaying a single permissions request form
 */
export default class UcdlibIamPagePermissionsSingle extends window.Mixin(LitElement)
  .with(window.LitCorkUtils) {

  static get properties() {
    return {
      formType: {state: true},
      associatedObjectId: {state: true}
    };
  }

  constructor() {
    super();
    this.render = render.bind(this);

    this.formTypes = {
      'onboarding': {title: 'Permissions for New Employee'}
    };
    this.formType = 'onboarding';
    this.associatedObjectId = 0;

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
    if ( !Object.keys(this.formTypes).includes(e.location.path[1]) ){
      requestAnimationFrame(() => this.AppStateModel.showError('This page does not exist!'));
      return;
    }
    this.formType = e.location.path[1];
    this.associatedObjectId = e.location.path[2];
    this.AppStateModel.setTitle({text: this.formTypes[this.formType].title, show: true});
    this.AppStateModel.showLoaded(this.id);
  }

  /**
   * @description Do data retrieval required to display this page
   */
  async getRequiredPageData(){
    const promises = [];
    if ( this.formType == 'onboarding' ){
      promises.push(this.OnboardingModel.getById(this.associatedObjectId));
    }
    await Promise.all(promises);
  }

  _onOnboardingSubmissionRequest(e){
    console.log(e);
  }

}

customElements.define('ucdlib-iam-page-permissions-single', UcdlibIamPagePermissionsSingle);