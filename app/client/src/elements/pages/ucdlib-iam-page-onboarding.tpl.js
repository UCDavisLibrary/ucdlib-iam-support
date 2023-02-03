import { html } from 'lit';

/**
 * @description Main render function
 * @returns {TemplateResult}
 */
export function render() { 
  return html`
  <div class='l-container l-basic--flipped'>
    <div class="l-sidebar-second">
      <a href="/onboarding/new" class="focal-link category-brand--redbud">
        <div class="focal-link__figure focal-link__icon">
          <i class="fas fa-user-plus fa-2x"></i>
        </div>
        <div class="focal-link__body">
          <strong>Make New Request</strong>
        </div>
      </a>
    </div>
    <div class="l-content">
      <section class="brand-textbox category-brand__background u-space-mb">
        TODO: If HR or Admin, list of active onboarding requests will go here!
      </section>
      <section class="brand-textbox category-brand__background category-brand--pinot">
        TODO: If supervisor, history of onboarding requests will go here!
      </section>
    </div>
  </div>
`;}