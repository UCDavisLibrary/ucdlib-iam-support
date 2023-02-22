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
      <ucdlib-iam-onboarding-list
        panel-title='Active Onboarding Requests'
        panel-icon='fa-folder-open'
        brand-color='arboretum'
      ></ucdlib-iam-onboarding-list>
      <section class="brand-textbox category-brand__background category-brand--pinot">
        TODO: If supervisor, history of onboarding requests will go here!
      </section>
    </div>
  </div>
`;}