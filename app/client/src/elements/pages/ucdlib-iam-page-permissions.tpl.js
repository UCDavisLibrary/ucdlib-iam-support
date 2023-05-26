import { html } from 'lit';
import applicationList from "../../utils/applications";

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
      ${this.renderApplicationsSelect()}
      ${this.renderEmployeeSelect()}
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
    <div>
      <h2 class='heading--underline'>Request Permissions For</h2>
      <div class="priority-links">
        <div class="priority-links__item">
          <a href="#applications" class="vertical-link vertical-link--circle category-brand--tahoe">
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
          <a href="#employee" class="vertical-link vertical-link--circle category-brand--redwood">
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
    <div ?hidden=${!this.userPermissionRequests.length}>
    <h2 class='heading--underline'>Your Previous Requests</h2>
    <div class='update-list'>
      <div class='update-list-header'>
        <div class='update-list-name'>Name</div>
        <div class='update-list-date'>Last Update</div>
        <div class='update-list-icon'></div>
      </div>
      ${this.userPermissionRequests.map(req => html`
        <div class='update-list-item'>
          <div class='update-list-name'>${req.additionalData.employeeFirstName} ${req.additionalData.employeeLastName}</div>
          <div class='update-list-date'>${new Date(req.submitted).toLocaleDateString()}</div>
          <div class='update-list-icon'>
            <a href='/permissions/update/${req.permissionRequestId	}'><i class='fas fa-chevron-circle-right'></i></a>
          </div>
        </div>

      `)}
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
    <div class='form-single-col'>
      ${this.reports.length ? html`
        <h2 class='heading--underline'>Select an Employee</h2>
        <form @submit=${this._onReportsFormSubmit}>
          <div class="field-container">
            <label>Your Direct Reports</label>
            <select @input=${(e) => this.selectedReport = e.target.value} .value=${this.selectedReport} required>
              <option value="">--Please choose an employee--</option>
              ${this.reports.map(r => html`
                <option .value=${r.iamId} ?selected=${this.selectedReport == r.iamId} >${r.firstName} ${r.lastName}</option>
              `)}
            </select>
            <button class="u-space-mt--large btn btn--alt btn--block" type="submit">Next</button>
          </div>
        </form>
      ` : html`
        <section class="brand-textbox category-brand__background category-brand--redbud u-space-mb--large">
          You have no direct reports on record.
        </section>
      `}
    </div>
  </div>
  `;
}

/**
 * @description Template for the select applications page
 * @returns {TemplateResult}
 */
export function renderApplicationsSelect(){
  return html`
  <div id='perm-applications'>
    <form class='form-single-col' @submit=${this._onSubmit}>
      <h2 class='heading--underline'>Select Applications</h2>
      <p>Select the applications you would like to request access to.
        If the application is not listed, leave the field blank; you will have the opportunity to create a custom request on the next page.</p>
      <ucd-theme-slim-select @change=${(e) => this.selectedApplications = e.detail.map(app => app.value)}>
        <select multiple>
          ${applicationList.map(app => html`
            <option .value=${app.id} ?selected=${this.selectedApplications.includes(app.id)}>${app.name}</option>
          `)}
        </select>
      </ucd-theme-slim-select>
      <button class="u-space-mt--large btn btn--alt btn--block" type="submit">Next</button>
    </form>
  </div>
  `;
}

/**
 * @description Template for the select employee page
 * @returns {TemplateResult}
 */
export function renderEmployeeSelect(){
  return html`
  <div id='perm-employee'>
      <ucdlib-iam-search
        @select=${e => this._onEmployeeSelect(e.detail.status)}
        reset-on-select
        search-param='name'
        class='u-space-px--medium u-space-py--medium u-align--auto border border--gold'>
      </ucdlib-iam-search>
  </div>
  `;
}
