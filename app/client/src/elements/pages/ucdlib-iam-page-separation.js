import { LitElement } from 'lit';
import {render} from "./ucdlib-iam-page-separation.tpl.js";
import "../components/ucdlib-iam-separation-list";
import "../components/ucdlib-iam-separation-search";
import "../components/ucdlib-iam-modal";
import "../components/ucdlib-iam-existing-search";

/**
 * @classdesc Lists active separation requests and provides navigation to additional separations actions
 */
export default class UcdlibIamPageSeparation extends window.Mixin(LitElement)
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

    this._injectModel('AppStateModel', 'SeparationModel', 'AuthModel');

    this.activeId = 'sp-list-active'; //only show if hr or admin
    this.supervisorId = 'sp-list-supervisor';
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
   * @description Attached to SeparationModel separation-query event
   * @param {Object} e cork-app-utils event
   */
  _onSeparationQuery(e){
    if ( e.state === 'error'){
      let msg = 'Unable to load separation requests';
      if ( e.error.details && e.error.details.message ){
        msg =  e.error.details.message;
      }
      this.AppStateModel.showError(msg);
    }
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

  /**
   * @method _onAppStateUpdate
   * @description bound to AppStateModel app-state-update event
   *
   * @param {Object} e
   */
  async _onAppStateUpdate(e) {
    if ( e.page != this.id ) return;
    this.AppStateModel.showLoaded(this.id);
  }
  

  showSearchModal(){
    const modal = this.querySelector('#sp-search');
    modal.show();
  }

  hideSearchModal(){
    const modal = this.querySelector('#sp-search');
    modal.hide();
  }

}

customElements.define('ucdlib-iam-page-separation', UcdlibIamPageSeparation);