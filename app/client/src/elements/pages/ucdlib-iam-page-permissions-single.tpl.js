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
          <div class="field-container">
            <label>Main Website</label>
            <ucd-theme-slim-select @change=${(e) => this.pMainWebsiteRoles = e.detail.map(g => g.value)}>
              <select multiple>
                ${this.pMainWebsiteRolesList.map(r => html`
                  <option .value=${r.slug} ?selected=${this.pMainWebsiteRoles.includes(r.slug)}>${r.label}</option>
                `)}
              </select>
            </ucd-theme-slim-select>
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

`;}