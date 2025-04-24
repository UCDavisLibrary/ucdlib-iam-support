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
    this.token = this.AuthModel.getToken().token || null;
    this.employeeId = this.AuthModel.getToken().token.employeeId || null;
    this.firstName = this.AuthModel.getToken().token.given_name || null;
    this.lastName = this.AuthModel.getToken().token.family_name || null;
    this.metadata = [];
    this.updateList = [];
    this.noChange = true;

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
   * @method handleCheckboxChange
   * @description handle the checkbox changing
   *
   * @param {Object} e
   */
  handleDirectReportChange(e) {
    this.noChange = e.target.checked === this.enableDirectReportNotification;
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

    const r = await this.EmployeeModel.getMetadata(this.employeeId);
    this.metadata = r.payload.results[0].metadata;

    this.currentDirectReportStatus();

    /* More Metadata should be made into a new function */
   
  }

  /**
   * @method currentDirectReportStatus
   * @description get the current Direct Report Status
   */
  async currentDirectReportStatus(){
    let meta = this.metadata.find(m => m.metadataKey === "direct_reports_notification");
    this.directReportsId = meta.id;
    meta = meta ? meta.metadataValue.toLowerCase() : false;
    this.enableDirectReportNotification = meta === "true" ? true: false;

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

    const checkboxes = this.renderRoot.querySelectorAll('input[type="checkbox"]');

    checkboxes.forEach(checkbox => {
      
      if(checkbox.name == "direct-reports") {
        this.updateList.push({
          id: this.directReportsId,
          employeeId: this.employeeId,
          metadataKey: "direct_reports_notification",
          metadataValue: String(checkbox.checked)
        });
      }
      
      /* Add future if statements for metadata here */
    });

    const r = await this.EmployeeModel.updateMetadata(this.updateList, this.employeeId);

    let successText = `${this.firstName} ${this.lastName}'s User Settings has been updated.`;

    if ( r.state === 'loaded' ) {
      this.AppStateModel.refresh();
      setTimeout(() => {
        this.AppStateModel.showAlertBanner({message: successText, brandColor: 'quad'});
      }, 1000);
      this.updateInProgress = false;

    } else {
      if ( r.error?.payload?.is400 ) {
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