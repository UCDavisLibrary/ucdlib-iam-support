import { LitElement } from 'lit';
import {render} from "./ucdlib-iam-page-user-settings.tpl.js";
import { LitCorkUtils, Mixin } from '@ucd-lib/cork-app-utils';


/**
 * @description Landing page for user settings
 */
export default class UcdlibIamPageUserSettings extends Mixin(LitElement)
  .with(LitCorkUtils) {

  static get properties() {
    return {
      updateInProgress: {state: true},
      results: {type: Array}
    };
  }

  constructor() {
    super();
    this.render = render.bind(this);
    this._injectModel('AppStateModel','AuthModel', 'EmployeeModel');
    this.token = null;
    this.firstName = null;
    this.lastName = null;
    this.metadata = [];
    this.updateList = [];
    this.noChange = true;
    this.enableDirectReportNotification = null;
    this.initialDirectReportNotification = null;
  }

  /**
   * @description Disables the shadowdom
   * @returns
   */
  createRenderRoot() {
    return this;
  }


  /* Add the check for the new user_setting enable flag */
  
  /**
   * @method handleDirectReportChange
   * @description handle the checkbox changing direct report
   *
   * @param {Object} e
   */
  handleDirectReportChange(e) {

    this.enableDirectReportNotification = e.target.checked;
    this.noChange = this.initialDirectReportNotification === this.enableDirectReportNotification;

    this.requestUpdate();
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
    
    this.token = this.AuthModel.getToken().token || null;
    this.firstName = this.token.given_name || null;
    this.lastName = this.token.family_name || null;
    this.iamId = this.token.iamId || null;
    this.ccReportsToolTip = "By default, only DIRECT supervisors are CCed on their employee's RT tickets. Checking this box will ensure you are CCed on RT tickets submitted by anyone below you in your reporting line.";

    const r = await this.EmployeeModel.getMetadata(this.iamId, "iamId");

    this.metadata = r.payload.results[0].metadata;

    this.currentDirectReportStatus();

    /* More Metadata should be made into a new function */
   
  }

  /**
   * @method currentDirectReportStatus
   * @description get the current Direct Report Status
   */
  async currentDirectReportStatus(){
    let meta = this.metadata.find(m => m.metadataKey === "cc_notification");
    this.directReportsId = meta.metadataId;
    if(typeof meta.metadataValue === 'string') {
      meta = meta ? meta.metadataValue.toLowerCase() : false;
      this.initialDirectReportNotification = meta === "true" ? true: false;

    } else {
      meta = meta.metadataValue;
      this.initialDirectReportNotification = meta;
    }
    this.enableDirectReportNotification =  this.initialDirectReportNotification;

    this.requestUpdate();
  }

  /**
   * @description Event handler for when the edit form is submitted
   * @param {*} e - form submit event
   * @returns
   */
  async _onEditSubmit(e){
    e.preventDefault();
    
    if ( this.updateInProgress ) return;
    this.updateInProgress = true;

      
    this.updateList.push({
      id: this.directReportsId,
      metadataValue: this.enableDirectReportNotification
    });
      
    /* Add future object statements for metadata here */

    let r = [];

    for(let element of this.updateList){
      let res = await this.EmployeeModel.updateMetadata(element, this.iamId);
      r.push(res);
    }

    const allLoaded = r.every(item => item.state === 'loaded');
    const hasIs400 = r.some(item => item.error?.payload?.is400 === true);


    let successText = `${this.firstName} ${this.lastName}'s User Settings has been updated.`;

    if (allLoaded) {
      this.AppStateModel.refresh();
      setTimeout(() => {
        this.AppStateModel.showAlertBanner({message: successText, brandColor: 'quad'});
      }, 1000);
      this.updateInProgress = false;

    } else {
      if ( hasIs400) {
        this.requestUpdate();
        this.AppStateModel.showAlertBanner({message: 'Error when updating the user settings. Form data needs fixing.', brandColor: 'double-decker'});
        this.logger.error('Error in form updating user settings', r);
      } else {
        this.AppStateModel.showAlertBanner({message: 'An unknown error occurred when updating your User Settings', brandColor: 'double-decker'});
        this.logger.error('Error updating user settings', r);
      }
    }
  }



}

customElements.define('ucdlib-iam-page-user-settings', UcdlibIamPageUserSettings);