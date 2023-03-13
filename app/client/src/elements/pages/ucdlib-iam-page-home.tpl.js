import { html } from 'lit';

/**
 * @description Main render function for this element
 * @returns {TemplateResult}
 */
export function render() { 
  return html`
  <div class='l-container u-space-mt--large'>
    <div class="l-3col">
      <div class='l-first'>
        <div class="panel panel--icon panel--icon-custom panel--icon-${this.colors.hr}">
          <h2 class="panel__title u-space-mb"><span class="panel__custom-icon fas fa-folder"></span>Human Resources</h2>
          <section>
          <a href="/onboarding/new" class="focal-link category-brand--${this.colors.hr} u-space-px--small">
            <div class="focal-link__figure focal-link__icon focal-link__icon--xs">
              <i class="fas fa-chevron-right"></i>
            </div>
            <div class="focal-link__body">
              <strong>New Onboarding Request</strong>
            </div>
          </a>
          <a href="/separation/new" class="focal-link category-brand--${this.colors.hr} u-space-px--small">
            <div class="focal-link__figure focal-link__icon focal-link__icon--xs">
              <i class="fas fa-chevron-right"></i>
            </div>
            <div class="focal-link__body">
              <strong>New Separation Request</strong>
            </div>
          </a>
          </section>
        </div>
      </div>
      <div class='l-second'>
        <div class="panel panel--icon panel--icon-custom panel--icon-${this.colors.supervisors}">
          <h2 class="panel__title u-space-mb"><span class="panel__custom-icon fas fa-network-wired"></span>Supervisors</h2>
          <section>
          <a href="/onboarding" class="focal-link  category-brand--${this.colors.supervisors} u-space-px--small">
            <div class="focal-link__figure focal-link__icon focal-link__icon--xs">
              <i class="fas fa-chevron-right"></i>
            </div>
            <div class="focal-link__body">
              <strong>Employee Onboarding Status</strong>
            </div>
          </a>
          <a href="/separation" class="focal-link  category-brand--${this.colors.supervisors} u-space-px--small">
            <div class="focal-link__figure focal-link__icon focal-link__icon--xs">
              <i class="fas fa-chevron-right"></i>
            </div>
            <div class="focal-link__body">
              <strong>Employee Separation Status</strong>
            </div>
          </a>
          <a href="/permissions" class="focal-link  category-brand--${this.colors.supervisors} u-space-px--small">
            <div class="focal-link__figure focal-link__icon focal-link__icon--xs">
              <i class="fas fa-chevron-right"></i>
            </div>
            <div class="focal-link__body">
              <strong>Update Employee Permissions</strong>
            </div>
          </a>
          </section>
        </div>
      </div>
      <div class='l-third'>
        <div class="panel panel--icon panel--icon-custom panel--icon-${this.colors.employees}">
          <h2 class="panel__title u-space-mb"><span class="panel__custom-icon fas fa-user"></span>Employees</h2>
          <section>
          <a href="/permissions" class="focal-link category-brand--${this.colors.employees} u-space-px--small">
            <div class="focal-link__figure focal-link__icon focal-link__icon--xs">
              <i class="fas fa-chevron-right"></i>
            </div>
            <div class="focal-link__body">
              <strong>Request Permissions</strong>
            </div>
          </a>
          </section>
        </div>
      </div>
    </div>
  </div>

`;}