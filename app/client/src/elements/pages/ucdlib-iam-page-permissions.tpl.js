import { html } from 'lit';

/**
 * @description Main template for the element
 * @returns {TemplateResult}
 */
export function render() {
  return html`
  <div class='l-container u-space-pb'>
    <ucdlib-pages selected=${'perm-' + this.page}>
      ${this.renderHome()}
      ${this.renderReportSelect()}
    </ucdlib-pages>

  </div>
`;}

/**
 * @description Template for the home page
 * @returns {TemplateResult}
 */
export function renderHome(){
  return html`
  <div id='perm-home'>
    <h2 class='heading--underline'>Request Permissions For</h2>
    <div class="priority-links">
      <div class="priority-links__item">
        <a href="" class="vertical-link vertical-link--circle category-brand--tahoe">
          <div class="vertical-link__figure">
            <i class="vertical-link__image fas fa-user-plus fa-3x"></i>
          </div>
          <div class="vertical-link__title">
            Yourself <br> <span class='fw-light'>(requires supervisor approval)</span>
          </div>
        </a>
      </div>
      <div class="priority-links__item">
        <a href="#report" class="vertical-link vertical-link--circle category-brand--pinot">
          <div class="vertical-link__figure">
            <i class="vertical-link__image fas fa-network-wired fa-3x"></i>
          </div>
          <div class="vertical-link__title">
            Your Direct Report
          </div>
        </a>
      </div>
      <div class="priority-links__item">
        <a href="" class="vertical-link vertical-link--circle category-brand--redwood">
          <div class="vertical-link__figure">
            <i class="vertical-link__image fas fa-user-secret fa-3x"></i>
          </div>
          <div class="vertical-link__title">
            Another Employee <br> <span class='fw-light'>(might require supervisor approval)</span>
          </div>
        </a>
      </div>
    </div>
  </div>
  `;
}

/**
 * @description Template for the select direct report page
 * @returns {TemplateResult}
 */
export function renderReportSelect(){
  return html`
  <div id='perm-report'>
  <h2 class='heading--underline'>Select an Employee</h2>
  </div>
  `;
}
