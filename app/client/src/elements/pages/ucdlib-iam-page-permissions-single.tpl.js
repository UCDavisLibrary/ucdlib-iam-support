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
                <label>Additional Notes</label>
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
              class="btn btn--alt btn--search">Submit
            </button>
          </div>
        </form>
      </div>
      <div class="l-sidebar-second">
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
  }

  return html`
    <ucdlib-iam-modal id='perm-help-modal' dismiss-text='Close' content-title=${title}>
      ${content}
    </ucdlib-iam-modal>
  `;
}