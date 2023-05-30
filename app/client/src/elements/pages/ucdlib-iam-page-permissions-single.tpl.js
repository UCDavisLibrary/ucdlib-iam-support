import { html } from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';

/**
 * @description Primary render function
 * @returns {TemplateResult}
 */
export function render() {
  return html`
  <div class='l-container u-space-pb'>
    <div class='l-basic--flipped'>
      <div class="l-content">
        <form @submit=${this._onSubmit}>
          <div ?hidden=${this.formType != 'onboarding'} class='u-space-mb--large'>
            <h2 class="heading--underline">Physical Access and Equipment</h2>
            <div class="l-2col l-2col--33-67 field-row">
              <div class='l-first'>
                ${this.renderGroupLabel('Tech Equipment', 'equipment')}
              </div>
              <div class='l-second'>
                <div class="field-container">
                  <label for="work-location">Primary Work Location</label>
                  <input id='work-location' type='text' placeholder='Where should equipment be set up?' @input=${e => this.workLocation = e.target.value} .value=${this.workLocation}>
                </div>
                <div class="field-container">
                  <label for="computer-equipment">Computer Equipment</label>
                  <select id="computer-equipment" @input=${(e) => this.computerEquipment = e.target.value}>
                    <option value='none' ?selected=${!this.computerEquipment}>-- Select an option --</option>
                    ${this.computerEquipmentOptions.map(e => html`
                      <option value=${e.value} ?selected=${e.value == this.computerEquipment}>${e.label}</option>
                    `)}
                  </select>
                </div>
                ${this.renderCheckbox('officePhone', 'Needs an Office Phone')}
                ${this.renderTextArea('specialEquipment', 'Special Equipment', 4)}
                ${this.renderTextArea('equipmentNotes', 'Additional Notes', 4)}
              </div>
            </div>
            <div class="l-2col l-2col--33-67 field-row">
              <div class='l-first'>
                ${this.renderGroupLabel('Facilities', 'facilities')}
              </div>
              <div class='l-second'>
                ${this.renderCheckbox('facilitiesErgonmic', 'Needs an Ergonomic Assessment')}
                ${this.renderCheckbox('facilitiesKeys', 'Needs Physical Keys')}
                ${this.renderCheckbox('facilitiesAlarmCodes', 'Needs Alarm Codes')}
                ${this.renderTextArea('facilitiesDetails', 'Facilities Request Details', 6)}
              </div>
            </div>
          </div>
          <div class='u-space-mb--large'>
            <h2 class="heading--underline">Applications</h2>
            <div class="l-2col l-2col--33-67 field-row" ?hidden=${this.hideApplication('main-website')}>
              <div class='l-first'>
                ${this.renderGroupLabel('Main Website', 'main-website')}
              </div>
              <div class='l-second'>
                <div class="field-container">
                  <label>Roles</label>
                  <ucd-theme-slim-select @change=${(e) => this.pMainWebsiteRoles = e.detail.map(g => g.value)}>
                    <select multiple>
                      ${this.pMainWebsiteRolesList.map(r => html`
                        <option .value=${r.slug} ?selected=${this.pMainWebsiteRoles.includes(r.slug)}>${r.label}</option>
                      `)}
                    </select>
                  </ucd-theme-slim-select>
                </div>
                ${this.renderTextArea('pMainWebsiteNotes', 'Notes', 4)}
              </div>
            </div>
            <div class="l-2col l-2col--33-67 field-row" ?hidden=${this.hideApplication('intranet')}>
              <div class='l-first'>
                ${this.renderGroupLabel('Staff Intranet', 'intranet')}
              </div>
              <div class='l-second'>
                <div class="field-container">
                  <label>Roles</label>
                  <ucd-theme-slim-select @change=${(e) => this.pIntranetRoles = e.detail.map(g => g.value)}>
                    <select multiple>
                      ${this.pIntranetRolesList.map(r => html`
                        <option .value=${r.slug} ?selected=${this.pIntranetRoles.includes(r.slug)}>${r.label}</option>
                      `)}
                    </select>
                  </ucd-theme-slim-select>
                </div>
              </div>
            </div>
            <div class="l-2col l-2col--33-67 field-row" ?hidden=${this.hideApplication('alma')}>
              <div class='l-first'>
                ${this.renderGroupLabel('Alma', 'alma')}
              </div>
              <div class='l-second'>
                <ucdlib-iam-alma id='alma-user-lookup' @role-select=${e => this.pAlmaRoles = e.detail.roles}></ucdlib-iam-alma>
              </div>
            </div>
            <div class="l-2col l-2col--33-67 field-row" ?hidden=${this.hideApplication('libguides')}>
              <div class='l-first'>
                ${this.renderGroupLabel('Libguides', 'libguides')}
              </div>
              <div class='l-second'>
                <div class="field-container">
                  <label>Roles</label>
                  <select @input=${(e) => this.pLibguides = e.target.value}>
                    <option value='none' ?selected=${!this.pLibguides}>-- Select an option --</option>
                    ${this.libguidesRoles.map(e => html`
                      <option value=${e.value} ?selected=${e.value == this.pLibguides}>${e.label}</option>
                    `)}
                  </select>
                </div>
              </div>
            </div>
            <div class="l-2col l-2col--33-67 field-row" ?hidden=${this.hideApplication('libcal')}>
              <div class='l-first'>
                ${this.renderGroupLabel('Libcal', 'libcal')}
              </div>
              <div class='l-second'>
                <div class="field-container">
                  <label>Roles</label>
                  <select @input=${(e) => this.pLibcal = e.target.value}>
                    <option value='none' ?selected=${!this.pLibcal}>-- Select an option --</option>
                    ${this.libcalRoles.map(e => html`
                      <option value=${e.value} ?selected=${e.value == this.pLibcal}>${e.label}</option>
                    `)}
                  </select>
                </div>
              </div>
            </div>
            <div class="l-2col l-2col--33-67 field-row" ?hidden=${this.hideApplication('slack')}>
              <div class='l-first'>
                ${this.renderGroupLabel('Slack', 'slack')}
              </div>
              <div class='l-second'>
                ${this.renderCheckbox('pSlack', 'Create Account')}
              </div>
            </div>
            <div class="l-2col l-2col--33-67 field-row" ?hidden=${this.hideApplication('bigsys')}>
              <div class='l-first'>
                ${this.renderGroupLabel('Bigsys', 'bigsys')}
              </div>
              <div class='l-second'>
                <label>Access to:</label>
                ${this.renderCheckbox('pBigsysPatron', 'Patron Lookup Tool')}
                ${this.renderCheckbox('pBigsysTravel', 'Travel Forms and Expenses')}
                ${this.renderCheckbox('pBigsysOpenAccess', 'Open Access Funds Management')}
                ${this.renderCheckbox('pBigsysCheckProcessing', 'Alma-KFS Integration Application')}
                ${this.renderTextArea('pBigsysOther', 'Other:')}
              </div>
            </div>
            <div class="l-2col l-2col--33-67 field-row" ?hidden=${this.hideApplication('calendly')}>
              <div class='l-first'>
                ${this.renderGroupLabel('Calendly', 'calendly')}
              </div>
              <div class='l-second'>
                <div class="field-container">
                  TODO: ????
                </div>
              </div>
            </div>
            <div class="l-2col l-2col--33-67 field-row" ?hidden=${this.hideApplication('lang-prize')}>
              <div class='l-first'>
                ${this.renderGroupLabel('Lang Prize', 'lang-prize')}
              </div>
              <div class='l-second'>
                <div class="field-container">
                  TODO: Ask Mark
                </div>
              </div>
            </div>
            <div class="l-2col l-2col--33-67 field-row" ?hidden=${this.hideApplication('aggie-open')}>
              <div class='l-first'>
                ${this.renderGroupLabel('Aggie Open', 'aggie-open')}
              </div>
              <div class='l-second'>
                <div class="field-container">
                  TODO: Ask Mark
                </div>
              </div>
            </div>
            <div class="l-2col l-2col--33-67 field-row" ?hidden=${this.hideApplication('custom-applications')}>
              <div class='l-first'>
                ${this.renderGroupLabel('List Applications', 'custom-applications')}
              </div>
              <div class='l-second'>
                ${this.renderTextArea('customApplications', '', 10)}
              </div>
            </div>
          </div>
          <div>
            <h2 class="heading--underline">Additional Info</h2>
            <div class="l-2col l-2col--33-67 field-row">
              <div class='l-first'>
                ${this.renderGroupLabel('Notes')}
              </div>
              <div class='l-second'>
                ${this.renderTextArea('notes', '', 6)}
              </div>
            </div>
            <div class='u-space-my--large flex-justify-center'>
              <button
                ?disabled=${this.submitting}
                type='submit'
                class="btn btn--alt btn--search">${this.isAnEdit ? 'Update' : 'Submit'}
              </button>
            </div>
          </div>
        </form>
      </div>
      <div class="l-sidebar-second">
        <div class='category-brand__background-light-gold o-box u-space-mb' ?hidden=${!this.isAnEdit}>
          <div class="panel panel--icon panel--icon-custom panel--icon-quad o-box background-transparent">
            <h2 class="panel__title u-space-mb"><span class="panel__custom-icon fas fa-check-circle"></span>Submitted</h2>
            <div><label class='u-inline'>On:</label> ${this.submitted}</div>
            <div><label class='u-inline'>By:</label> ${this.submittedBy}</div>
          </div>
        </div>
        <ucdlib-rt-history ticket-id=${this.rtTicketId} ?hidden=${!(this.formType == 'update' && this.isAnEdit)}></ucdlib-rt-history>
        <a href="/onboarding/${this.associatedObjectId}" class="focal-link category-brand--poppy u-space-mb" ?hidden=${this.formType != 'onboarding'}>
          <div class="focal-link__figure focal-link__icon">
            <i class="fas fa-door-open fa-2x"></i>
          </div>
          <div class="focal-link__body">
            <strong>Onboarding Request</strong>
          </div>
        </a>
      </div>
    </div>
  </div>
  ${this.renderHelpModal()}
`;}

/**
 * @description Render function for help modal
 * @returns {TemplateResult}
 */
export function renderHelpModal(){
  let content = html``;
  let title = '';

  if ( this.helpModal === 'main-website' ){
    title = 'Main Website';
    const url = 'https://library.ucdavis.edu';
    content = html`
      <div>
        The main website is located at <a href=${url}>${url}</a>, and can be logged into at <a href='${url}/wp-admin'>${url}/wp-admin</a>
      </div>
      <div>
        By default, all non-student and non-TES library employees are assigned the "author" role upon first login.
      </div>
      <h3>Roles</h3>
        <ul class='list--arrow'>
          ${this.pMainWebsiteRolesList.map(r => html`<li><b>${r.label}</b> <br /> ${r.description}</li>`)}
        </ul>
    `;
  } else if ( this.helpModal === 'intranet' ) {
    title = 'Staff Intranet';
    const url = 'https://staff.library.ucdavis.edu';
    content = html`
      <div>
        The staff intranet is located at <a href=${url}>${url}</a>, and can be logged into at <a href='${url}/wp-admin'>${url}/wp-admin</a>
      </div>
      <div>
        By default, all non-student and non-TES library employees are assigned the "editor" role upon first login.
      </div>
      <h3>Roles</h3>
        <ul class='list--arrow'>
          ${this.pIntranetRolesList.map(r => html`<li><b>${r.label}</b> <br /> ${r.description}</li>`)}
        </ul>
    `;
  } else if ( this.helpModal === 'alma' ){
    title = 'Alma';
    content = html`
      <div>Alma is the Integrated Library System (ILS) used by the University of California</div>
    `;
  } else if ( this.helpModal === 'equipment' ){
    title = 'Tech Equipment';
    content = html`
      <div>All computer equipment will be set up at the specified primary work location prior to employee start date.</div>
    `;
  } else if ( this.helpModal === 'libguides' ){
    title = 'Libguides';
    const url = 'https://guides.library.ucdavis.edu';
    content = html`
      <div>Libguides is located at <a href=${url}>${url}</a>.</div>
      <h3>Roles</h3>
        <ul class='list--arrow'>
          ${this.libguidesRoles.map(r => html`<li><b>${r.label}</b> <br /> ${r.description}</li>`)}
        </ul>
    `;
  } else if ( this.helpModal === 'libcal' ){
    title = 'Libcal';
    const url = 'https://reservations.library.ucdavis.edu';
    content = html`
      <div>Libcal is located at <a href=${url}>${url}</a>.</div>
      <h3>Roles</h3>
        <ul class='list--arrow'>
          ${this.libcalRoles.map(r => html`<li><b>${r.label}</b> <br /> ${r.description}</li>`)}
        </ul>
    `;
  } else if ( this.helpModal === 'calendly' ){
    title = 'Calendly';
    content = html`<div>TODO</div>`;
  } else if ( this.helpModal === 'facilities'){
    title = 'Facilities Request';
    content = html`
      <div>
        If you fill out any of these form fields, a separate RT ticket will be created and sent to the Management and Building Support department
      </div>
    `;
  } else if ( this.helpModal === 'slack' ){
    title = 'Slack';
    content = html`
      <ul class='list--arrow'>
        <li>The UC Davis Library slack workspace is <code>ucdlibrary.slack.com</code>.</li>
        <li>Employees will be sent an email when their account is created.</li>
        <li>To add a user to a specific channel, you must contact the channel owner.</li>
      </ul>
    `;
  } else if ( this.helpModal === 'bigsys' ){
    title = 'Bigsys';
    const url = 'https://bigsys.lib.ucdavis.edu';
    content = html`
      <div>Bigsys is an older server at <a href=${url}>${url}</a>, which still hosts a few applications, including:</div>
      <ul class='list--arrow'>
        <li><a href='https://bigsys.lib.ucdavis.edu/search/patron/'>Patron Lookup Tool</a></li>
        <li><a href='https://bigsys.lib.ucdavis.edu/travel/index.php'>Travel Forms and Expenses</a></li>
        <li><a href='https://bigsys.lib.ucdavis.edu/apps/openaccess/'>Open Access Funds Management</a></li>
        <li><a href='https://bigsys.lib.ucdavis.edu/reports/check_processing/index.php'>Alma-KFS Integration Application</a></li>
      </ul>
    `;
  } else if ( this.helpModal === 'lang-prize') {
    title = 'Lang Prize';
    content = html`
      <div>TODO: Ask Mark</div>
    `;
  } else if ( this.helpModal === 'aggie-open' ){
    title = 'Aggie Open';
    content = html`
      <div>TODO: Ask Mark</div>`;
  }
  else if ( this.helpModal === 'custom-applications' ){
    title = 'List Applications';
    content = html`
      <div>Provide the urls of the applications you need access to. More information is usually better than less.</div>`;
  }

  return html`
    <ucdlib-iam-modal id='perm-help-modal' dismiss-text='Close' content-title=${title}>
      ${content}
    </ucdlib-iam-modal>
  `;
}

/**
 * @description Renders a checkbox
 * @param {String} prop - Name of property to reflect
 * @param {String} label - Label for checkbox
 * @returns {TemplateResult}
 */
export function renderCheckbox(prop, label){
  return html`
    <div class="checkbox u-space-my">
      <ul class="list--reset">
        <li>
          <input id=${prop} type="checkbox" @input=${() => this[prop] = !this[prop]} .checked=${this[prop]}>
          <label for=${prop}>${label}</label>
        </li>
      </ul>
    </div>
  `;
}

/**
 * @description Renders a textarea element
 * @param {String} prop - Name of property to reflect
 * @param {String} label - Label for textarea
 * @param {Number} rows - rows attribute
 * @param {Number} cols - cols attribute
 * @returns {TemplateResult}
 */
export function renderTextArea(prop, label, rows=4, cols=48){
  const id = label ? prop : undefined;
  return html`
    <div class="field-container">
      ${label ? html`<label for=${prop}>${label}</label>` : html``}
      <textarea id=${ifDefined(id)} rows=${rows} cols=${cols}  @input=${e => this[prop] = e.target.value} .value=${this[prop]}></textarea>
    </div>
  `;
}

/**
 * @description Renders label for group of fields
 * @param {String} label - Text to display
 * @param {String} help - Slug for displaying help modal used in renderHelpModal function
 * @returns {TemplateResult}
 */
export function renderGroupLabel(label, help) {
  return html`
    <div>
      <label>${label}</label>
      ${help ? html`
        <div class='help-icon' @click=${() => this.showHelpModal(help)}>
          <i class='fas fa-question-circle'></i>
        </div>
      ` : html``}
    </div>
  `;
}
