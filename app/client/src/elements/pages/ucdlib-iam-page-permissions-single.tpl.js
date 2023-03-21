import { html } from 'lit';

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
          <h2 class="heading--underline">Physical Equipment and Access</h2>
          <div class="l-2col l-2col--33-67 field-row">
            <div class='l-first'>
              <div>
                <label>Tech Equipment</label>
                <div class='help-icon' @click=${() => this.showHelpModal('equipment')}>
                  <i class='fas fa-question-circle'></i>
                </div>
              </div>
            </div>
            <div class='l-second'>
              <div class="field-container">
                <label for="work-location">Primary Work Location</label>
                <input id='work-location' type='text' placeholder='Where should equipment be set up?' @input=${e => this.workLocation = e.target.value} .value=${this.workLocation}>
              </div>
              <div class="field-container">
                <label for="computer-equipment">Computer Equipment</label>
                <select id="computer-equipment" @input=${(e) => this.computerEquipment = e.target.value}>
                  <option .value='' ?selected=${!this.computerEquipment}>-- Select an option --</option>
                  ${this.computerEquipmentOptions.map(e => html`
                    <option .value=${e.value} ?selected=${e.value == this.computerEquipment}>${e.label}</option>
                  `)}
                </select>
              </div>
              <div class="checkbox u-space-my">
                <ul class="list--reset">
                  <li>
                    <input id="office-phone" type="checkbox" @input=${() => this.officePhone = !this.officePhone} .checked=${this.officePhone}>
                    <label for="office-phone">Needs an Office Phone</label>
                  </li>
                </ul>
              </div>
              <div class="field-container">
                <label for="special-equipment">Special Equipment</label>
                <textarea id='special-equipment' rows="4" cols="48"  @input=${e => this.specialEquipment = e.target.value} .value=${this.specialEquipment}></textarea>
              </div>
              <div class="field-container">
                <label for="equipment-notes">Additional Notes</label>
                <textarea id='equipment-notes' rows="4" cols="48"  @input=${e => this.equipmentNotes = e.target.value} .value=${this.equipmentNotes}></textarea>
              </div>
            </div>
          </div>
          <h2 class="heading--underline">Applications</h2>
          <div class="l-2col l-2col--33-67 field-row">
            <div class='l-first'>
              <div>
                <label>Main Website</label>
                <div class='help-icon' @click=${() => this.showHelpModal('main-website')}>
                  <i class='fas fa-question-circle'></i>
                </div>
              </div>
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
              <div class="field-container">
                <label for="main-website-notes">Notes</label>
                <textarea id='main-website-notes' rows="4" cols="48"  @input=${e => this.pMainWebsiteNotes = e.target.value} .value=${this.pMainWebsiteNotes}></textarea>
              </div>
            </div>
          </div>
          <div class="l-2col l-2col--33-67 field-row">
            <div class='l-first'>
              <div>
                <label>Libguides</label>
                <div class='help-icon' @click=${() => this.showHelpModal('libguides')}>
                  <i class='fas fa-question-circle'></i>
                </div>
              </div>
            </div>
            <div class='l-second'>
              <div class="field-container">
                <label>Roles</label>
                <select @input=${(e) => this.pLibguides = e.target.value}>
                  <option .value='' ?selected=${!this.pLibguides}>-- Select an option --</option>
                  ${this.libguidesRoles.map(e => html`
                    <option .value=${e.value} ?selected=${e.value == this.pLibguides}>${e.label}</option>
                  `)}
                </select>
              </div>
            </div>
          </div>
          <div class="l-2col l-2col--33-67 field-row">
            <div class='l-first'>
              <div>
                <label>Libcal</label>
                <div class='help-icon' @click=${() => this.showHelpModal('libcal')}>
                  <i class='fas fa-question-circle'></i>
                </div>
              </div>
            </div>
            <div class='l-second'>
              <div class="field-container">
                <label>Roles</label>
                <select @input=${(e) => this.pLibcal = e.target.value}>
                  <option .value='' ?selected=${!this.pLibcal}>-- Select an option --</option>
                  ${this.libcalRoles.map(e => html`
                    <option .value=${e.value} ?selected=${e.value == this.pLibcal}>${e.label}</option>
                  `)}
                </select>
              </div>
            </div>
          </div>
          <div class="l-2col l-2col--33-67 field-row">
            <div class='l-first'>
              <div>
                <label>Calendly</label>
                <div class='help-icon' @click=${() => this.showHelpModal('calendly')}>
                  <i class='fas fa-question-circle'></i>
                </div>
              </div>
            </div>
            <div class='l-second'>
              <div class="field-container">
                ????
              </div>
            </div>
          </div>
          <h2 class="heading--underline">Additional Info</h2>
          <div class="l-2col l-2col--33-67 field-row">
            <div class='l-first'>
              <div>
                <label>Notes</label>
              </div>
            </div>
            <div class='l-second'>
              <textarea rows="6" cols="48"  @input=${e => this.notes = e.target.value} .value=${this.notes}></textarea>
            </div>
          </div>
          <div class='u-space-my--large flex-justify-center'>
            <button 
              ?disabled=${this.submitting}
              type='submit' 
              class="btn btn--alt btn--search">${this.isAnEdit ? 'Update' : 'Submit'}
            </button>
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
  } else if ( this.helpModal === 'equipment' ){
    title = 'Tech Equipment';
    content = html`
      <div>All computer equipment will be set up at the specified primary work location prior to employee start date.</div>
    `;
  } else if ( this.helpModal === 'libguides' ){
    title = 'Libguides';
    const url = 'https://guides.library.ucdavis.edu/';
    content = html`
      <div>Libguides is located at <a href=${url}>${url}</a>.</div>
      <h3>Roles</h3>
        <ul class='list--arrow'>
          ${this.libguidesRoles.map(r => html`<li><b>${r.label}</b> <br /> ${r.description}</li>`)}
        </ul>
    `;
  } else if ( this.helpModal === 'libcal' ){
    title = 'Libcal';
    const url = 'https://reservations.library.ucdavis.edu/';
    content = html`
      <div>Libcal is located at <a href=${url}>${url}</a>.</div>
      <h3>Roles</h3>
        <ul class='list--arrow'>
          ${this.libcalRoles.map(r => html`<li><b>${r.label}</b> <br /> ${r.description}</li>`)}
        </ul>
    `;
  }

  return html`
    <ucdlib-iam-modal id='perm-help-modal' dismiss-text='Close' content-title=${title}>
      ${content}
    </ucdlib-iam-modal>
  `;
}