import { LitElement } from 'lit';
import {render} from "./ucdlib-iam-page-onboarding-reminders.tpl.js";
import { LitCorkUtils, Mixin } from '@ucd-lib/cork-app-utils';

import { AppComponentController } from '#controllers';

/**
 * @description Admin/HR page for configuring onboarding checklist reminder emails
 */
export default class UcdlibIamPageOnboardingReminders extends Mixin(LitElement)
  .with(LitCorkUtils) {

  static get properties() {
    return {
      intervals: {state: true},
      settings: {state: true},
      saving: {state: true}
    };
  }

  constructor() {
    super();
    this.render = render.bind(this);

    this.intervals = [];
    this.settings = { fromEmail: '', intervals: {} };
    this.saving = false;

    this.ctl = {
      appComponent : new AppComponentController(this),
    }

    this._injectModel('AppStateModel', 'ConfigModel', 'AuthModel');
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

    const token = this.AuthModel.getToken();
    if ( !token.hasAdminAccess && !token.hasHrAccess ) {
      this.AppStateModel.showError('You do not have permission to use this tool.');
      return;
    }

    this.ctl.appComponent.showPage();
    await this._loadSettings();
  }

  /**
   * @description Loads onboarding reminder settings from the server
   */
  async _loadSettings() {
    const r = await this.ConfigModel.getOnboardingReminderSettings();
    if ( r.state === 'loaded' ) {
      this.intervals = r.payload.intervals || [];
      this.settings = r.payload.settings || { fromEmail: '', intervals: {} };
    } else if ( r.state === 'error' ) {
      this.AppStateModel.showAlertBanner({message: 'Unable to load onboarding reminder settings.', brandColor: 'double-decker'});
    }
  }

  /**
   * @description Bound to the from-email input
   * @param {InputEvent} e
   */
  _onFromEmailInput(e) {
    this.settings = { ...this.settings, fromEmail: e.target.value };
  }

  /**
   * @description Bound to inputs in each interval's row
   * @param {String} slug
   * @param {String} field
   * @param {*} value
   */
  _onIntervalFieldInput(slug, field, value) {
    const intervals = { ...this.settings.intervals, [slug]: { ...this.settings.intervals[slug], [field]: value } };
    this.settings = { ...this.settings, intervals };
  }

  /**
   * @description Saves settings to the server
   */
  async _onSaveClicked() {
    this.saving = true;
    const r = await this.ConfigModel.updateOnboardingReminderSettings(this.settings);
    this.saving = false;
    if ( r.state === 'loaded' ) {
      this.settings = r.payload.settings || this.settings;
      this.AppStateModel.showAlertBanner({message: 'Settings saved.', brandColor: 'farmers-market'});
    } else if ( r.state === 'error' ) {
      this.AppStateModel.showAlertBanner({message: 'Error saving settings.', brandColor: 'double-decker'});
    }
  }

}

customElements.define('ucdlib-iam-page-onboarding-reminders', UcdlibIamPageOnboardingReminders);
