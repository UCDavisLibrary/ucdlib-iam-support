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
        <p>permissions request</p>
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