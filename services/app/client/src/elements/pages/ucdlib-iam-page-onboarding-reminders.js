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
    this.settings = this.freshSettings;
    this.saving = false;

    this.ctl = {
      appComponent : new AppComponentController(this),
    }

    this._injectModel('AppStateModel', 'ConfigModel', 'AuthModel');
  }

  get freshSettings() {
    return { fromEmail: '', intervals: {} };
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
    await this._loadSettings();
    this.ctl.appComponent.showPage();
  }

  /**
   * @description Loads onboarding reminder settings from the server
   */
  async _loadSettings() {
    this.intervals = [];
    this.settings = this.freshSettings;
    const r = await this.ConfigModel.getOnboardingReminderSettings();
    if ( r.state === 'loaded' ) {
      if ( r.payload.intervals) this.intervals = r.payload.intervals;
      if ( r.payload.settings ) this.settings = r.payload.settings;
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
      this.AppStateModel.showAlertBanner({message: 'Settings saved.', brandColor: 'farmers-market'});
      this.AppStateModel.refresh();
    } else if ( r.state === 'error' ) {
      this.AppStateModel.showAlertBanner({message: 'Error saving settings.', brandColor: 'double-decker'});
    }
  }

}

customElements.define('ucdlib-iam-page-onboarding-reminders', UcdlibIamPageOnboardingReminders);
