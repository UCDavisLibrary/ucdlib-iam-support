import { html, css } from 'lit';

import normalizeStyles from "@ucd-lib/theme-sass/normalize.css.js";
import headingStyles from "@ucd-lib/theme-sass/1_base_html/_headings.css";
import headingClassesStyles from "@ucd-lib/theme-sass/2_base_class/_headings.css";
import buttonStyles from "@ucd-lib/theme-sass/2_base_class/_buttons.css";
import formStyles from "@ucd-lib/theme-sass/1_base_html/_forms.css.js";
import listStyles from "@ucd-lib/theme-sass/1_base_html/_lists.css.js";
import listClassesStyles from "@ucd-lib/theme-sass/2_base_class/_lists.css.js";
import formsClassesStyles from "@ucd-lib/theme-sass/2_base_class/_forms.css.js";
import alertStyles from "@ucd-lib/theme-sass/4_component/_messaging-alert.css.js";
import breadcrumbStyles from "@ucd-lib/theme-sass/4_component/_nav-breadcrumbs.css.js";
import mediaLinkStyles from "@ucd-lib/theme-sass/4_component/_wysiwyg-media-link.css.js";
import layoutCss from "@ucd-lib/theme-sass/5_layout/_index.css.js";
import base from "@ucd-lib/theme-sass/1_base_html/_index.css.js";
import utility from "@ucd-lib/theme-sass/6_utility/_index.css.js";
import dtUtls from '@ucd-lib/iam-support-lib/src/utils/dtUtils.js';

/**
 * @description shadow styles
 * @returns 
 */
export function styles() {
  const elementStyles = css`
    :host {
      display: block;
      padding: 1rem 10rem;
    }
    [hidden] {
      display: none !important;
    }
    nav {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      margin-bottom: 1rem;
    }
    nav label {
      min-width: 9ch;
      padding-bottom: 0;
    }
    nav select {
      padding-left: .25rem;
      flex-grow: 1;
      width: initial;
    }
    .text-input-container {
      display: flex;
    }
    .btn--search {
      margin-top: 1rem;
    }
    .alert--error {
      padding: 1rem;
    }
    .link {
      cursor: pointer;
    }
    .breadcrumbs {
      padding-left: 0;
    }
    .results-list {
      max-width: 1000px;
      overflow-y: scroll;
    }
    .selected-person {
      background-color: rgba(var(--category-brand-rgb, var(--media-link-background)), 0.1);
      border: 1px solid #ffbf00;
    }
    .results-label {
      margin-top: 0;
      margin-bottom: .5rem;
      font-weight: 700;
    }
  `;

  return [
    normalizeStyles,
    headingStyles,
    headingClassesStyles,
    buttonStyles,
    formStyles,
    listStyles,
    listClassesStyles,
    formsClassesStyles,
    alertStyles,
    breadcrumbStyles,
    mediaLinkStyles,
    elementStyles,
    utility,
    layoutCss,
    base
  ];
}

/**
 * @description Primary render function
 * @returns {TemplateResult}
 */
export function render() { 
  return html`
    <div class='header'>
        <h2 class='heading--underline' ?hidden=${!this.widgetTitle}>${this.widgetTitle}</h2>
      </div>
      <ucdlib-pages selected=${this.page}>
        <div id='form'>
          ${this.wasError ? html`
          <div class="alert alert--error">An error occurred while querying the UC Davis IAM API!</div>
          ` : html``}
          <nav ?hidden=${this.hideNav}>
            <label>Search by: </label>
            <select id='search-param' @input=${e => this.searchParam = e.target.value}>
              ${this.navItems.map(item => html`
                <option value=${item.attribute} ?selected=${item.attribute == this.searchParam}>${item.label}</option>
              </li>
              `)}
            </select>
          </nav>
          <form @submit=${this._onSubmit} aria-label='Search for a UC Davis person'>
            <ucdlib-pages selected=${this.searchParam}>
              ${this.renderUserIdForm()}
              ${this.renderEmployeeIdForm()}
              ${this.renderStudentIdForm()}
              ${this.renderNameForm()}
            </ucdlib-pages>
            <button 
              ?disabled=${this.disableSearch} 
              type='submit' 
              class="btn btn--block btn--alt btn--search">Search${this.isFetching ? html`<span>ing</span>` : html``}</button>
          </form>
        </div>
        <div id='results'>
          <ol class='breadcrumbs'>
            <li><a class='link' @click=${() => this.page = 'form'}>Search Form</a></li>
            <li>Results</li>
          </ol>
          ${this.results.length ? html`
            <div class='results-list'>
              <p class='results-label'>Select an Employee:</p>
              ${this.results.map(person => html`
                <a @click=${() => this._onPersonClick(person.iamId)} class="media-link link ${this.selectedPersonId == person.iamId ? 'selected-person' : ''}">
                  <div class='media-link__body'>
                    <h3 class="heading--highlight">${person.oFullName}</h3>
                    ${person.employeeId ? html`
                      <div><strong>Employee Id: </strong><span>${person.employeeId}</span></div>
                    ` : html``}
                    ${person.studentId ? html`
                      <div><strong>Student Id: </strong><span>${person.studentId}</span></div>
                    ` : html``}
                  </div>
                </a>
              `)}
          </div>
          ` : html`
            <div class="alert">No people matched your search.</div>
          `}
        </div>
        <div id="information">
          <div class="field-container">
            <h3>IAM Patron Information</h3>
            <div class="focal-link__figure focal-link__icon">
                        <i class="fas fa-check fa-2x"></i>
                      </div>
            ${this.selectedPersonProfile ? html`
              <div class="responsive-table">
                <table class="table--striped">
                    <thead>
                      <tr><h3><th>General Information for ${this.informationHeaderID}</th></h3></tr>
                    </thead>
                    <tbody>
                      ${this.selectedPersonProfile.oFullName ? html`<tr><td><strong>Name</td></strong><td>${this.selectedPersonProfile.oFullName}</td></tr>`:html``}
                      ${this.selectedPersonProfile.studentId ? html`<tr><td><strong>Student ID</td></strong><td>${this.selectedPersonProfile.studentId}</td></tr>`:html``}
                      ${this.selectedPersonProfile.employeeId ? html`<tr><td><strong>Employee ID</td></strong><td>${this.selectedPersonProfile.employeeId}</td></tr>`:html``}
                      ${this.selectedPersonProfile.userID ? html`<tr><td><strong>Kerberos ID</td></strong><td>${this.selectedPersonProfile.userID}</td></tr>`:html``}
                      ${this.selectedPersonProfile.email ? html`<tr><td><strong>Email</td></strong><td>${this.selectedPersonProfile.email}</td></tr>`:html``}
                      ${this.alma ? html`<tr><td><strong>Alma</td></strong><td>View Alma Record: <a @click=${this.openAlmaInfoModal} >${this.alma.id}</a></td></tr>`:html``}
                      ${this.address ? html`<tr><td><strong>Current Address</td></strong><td>${this.address}</td></tr>`:html``}
                      </tbody>
                </table>

                <table class="table--striped">
                    <thead>
                      <tr><h3><th>Affiliation for ${this.informationHeaderID}</th></h3></tr>
                    </thead>
                    <tbody>
                      <tr><td><strong>Is Student</td></strong><td>${this.selectedPersonProfile.isStudent ? html`<p style="color:green;">&#x2713;</p>`:html`<p style="color:red;">&#x2715;</p>`}</td></tr>
                      <tr><td><strong>Is Employee</td></strong><td>${this.selectedPersonProfile.isEmployee ? html`<p style="color:green;">&#x2713;</p>`:html`<p style="color:red;">&#x2715;</p>`}</td></tr>
                      <tr><td><strong>Is External</td></strong><td>${this.selectedPersonProfile.isExternal ? html`<p style="color:green;">&#x2713;</p>`:html`<p style="color:red;">&#x2715;</p>`}</td></tr>
                      <tr><td><strong>Is Faculty</td></strong><td>${this.selectedPersonProfile.isFaculty ? html`<p style="color:green;">&#x2713;</p>`:html`<p style="color:red;">&#x2715;</p>`}</td></tr>
                      <tr><td><strong>Is Staff</td></strong><td>${this.selectedPersonProfile.isStaff ? html`<p style="color:green;">&#x2713;</p>`:html`<p style="color:red;">&#x2715;</p>`}</td></tr>
                      <tr><td><strong>Is HS Employee</td></strong><td>${this.selectedPersonProfile.isHSEmployee ? html`<p style="color:green;">&#x2713;</p>`:html`<p style="color:red;">&#x2715;</p>`}</td></tr>
                      
                    </tbody>
                </table>

              ${this.selectedPersonDepInfo ? 
                html`
                <table class="table--striped">
                    <thead>
                      <tr><h3><th>Department Information for ${this.informationHeaderID}</th></h3></tr>
                    </thead>
                    <tbody>
                          ${this.selectedPersonDepInfo.map(dep =>
                            html`
                              <tr><td><strong>Title</td></strong><td>${dep.titleOfficialName ? html`${dep.titleOfficialName} (${dep.titleCode})`: html`<p>Not Listed</p>`}</td></tr>
                              <tr><td><strong>Position Type</td></strong><td>${dep.positionType ? html`${dep.positionType} (${dep.positionTypeCode})`: html`<p>Not Listed</p>`}</td></tr>
                              <tr><td><strong>Department</td></strong><td>${dep.deptOfficialName ? html`${dep.deptOfficialName} (${dep.deptCode})`: html`<p>Not Listed</p>`}</td></tr>
                              <tr><td><strong>Start Date</td></strong><td>${dep.assocStartDate ? html`${dtUtls.fmtDatetime(dep.assocStartDate, true, true)}`: html`<p>Not Listed</p>`}</td></tr>
                              <tr><td><strong>End Date</td></strong><td>${dep.assocEndDate ? html`${dtUtls.fmtDatetime(dep.assocEndDate, true, true)}`: html`<p>Indefinite</p>`}</td></tr>
                              <tr><td><strong>Admin Title</td></strong><td>${dep.adminDeptOfficialName ? html`${dep.adminDeptOfficialName} (${dep.adminDept})`: html`<p>Not Listed</p>`}</td></tr>
                              <tr><td><strong>Appointment</td></strong><td>${dep.apptDeptOfficialName ? html`${dep.apptDeptOfficialName} (${dep.apptDeptCode})`: html`<p>Not Listed</p>`}</td></tr>
                            `
                          )}
                      </tbody>
                </table>
                `:html``}

              ${this.selectedPersonStdInfo ? 
                html`
                <table class="table--striped">
                    <thead>
                      <tr><h3><th>Student Information for ${this.informationHeaderID}</th></h3></tr>
                    </thead>
                    <tbody>
                          ${this.selectedPersonStdInfo.map(std =>
                            html`
                              <tr><td><strong>College</td></strong><td>${std.collegeName ? html`${std.collegeName}`: html`<p>Not Listed</p>`}</td></tr>
                              <tr><td><strong>Class</td></strong><td>${std.className ? html`${std.className}`: html`<p>Not Listed</p>`}</td></tr>
                              <tr><td><strong>Level</td></strong><td>${std.levelName ? html`${std.levelName}`: html`<p>Not Listed</p>`}</td></tr>
                              <tr><td><strong>Major</td></strong><td>${std.majorName ? html`${std.majorName}`: html`<p>Not Listed</p>`}</td></tr>
                              <tr><td><strong>Start Date</td></strong><td>${std.createDate ? html`${dtUtls.fmtDatetime(std.createDate, true, true)}`: html`<p>Not Listed</p>`}</td></tr>
                              <tr><td><strong>Modify Date</td></strong><td>${std.modifyDate ? html`${dtUtls.fmtDatetime(std.modifyDate, true, true)}`: html`<p>Not Listed</p>`}</td></tr>
                            `
                          )}
                      </tbody>
                </table>
                `:html``}

              </div> 
            `:html`
              <h4>There is no information on this individual in the IAM Database.</h4>
            `}
            

          </div>
        </div>
      </ucdlib-pages>
      <ucdlib-iam-modal id='alma-modal' dismiss-text='Close' content-title='Alma Record'>
          ${this.alma ? html`<pre style='font-size:15px;margin:0;'>${JSON.stringify(this.alma.payload, null, "  ")}</pre>` : html``}
      </ucdlib-iam-modal>
`;}


/**
 * @description Renders form for querying by kerberos id
 * @returns {TemplateResult}
 */
export function renderUserIdForm(){
  const view = this.searchParamsByKey.userId;
  return html`
    <div id=${view.attribute}>
      <div class="field-container">
        <label ?hidden=${!this.hideNav} for=${'inp-'+ view.attribute}>${view.label}</label>
        <div class='text-input-container'>
          <input 
            @input=${(e) => this.userId = e.target.value}
            .value=${this.userId}
            id=${'inp-'+ view.attribute} 
            type="text" 
            placeholder="Enter a UC Davis computing account...">
        </div>
        
      </div>
    </div>
  `;
}

/**
 * @description Renders form for querying by employee id
 * @returns {TemplateResult}
 */
export function renderEmployeeIdForm(){
  const view = this.searchParamsByKey.employeeId;
  return html`
    <div id=${view.attribute}>
      <div class="field-container">
        <label ?hidden=${!this.hideNav} for=${'inp-'+ view.attribute}>${view.label}</label>
        <div class='text-input-container'>
          <input 
            @input=${(e) => this.employeeId = e.target.value}
            id=${'inp-'+ view.attribute} 
            .value=${this.employeeId}
            type="number" 
            pattern="[0-9]*" 
            placeholder="Enter a UC Path ID number...">
        </div>
      </div>
    </div>
  `;
}

/**
 * @description Renders form for querying by student id
 * @returns {TemplateResult}
 */
export function renderStudentIdForm(){
  const view = this.searchParamsByKey.studentId;
  return html`
    <div id=${view.attribute}>
      <div class="field-container">
        <label ?hidden=${!this.hideNav} for=${'inp-'+ view.attribute}>${view.label}</label>
        <div class='text-input-container'>
          <input 
            @input=${(e) => this.studentId = e.target.value}
            .value=${this.studentId}
            id=${'inp-'+ view.attribute} 
            type="number" 
            pattern="[0-9]*" 
            placeholder="Enter a student ID number...">
        </div>
      </div>
    </div>
  `;
}

/**
 * @description Renders form for querying by name
 * @returns {TemplateResult}
 */
export function renderNameForm(){
  const view = this.searchParamsByKey.name;
  return html`
    <div id=${view.attribute}>
      <div class="field-container">
        <label for='inp-first-name'>First Name</label>
        <div class='text-input-container'>
          <input 
            @input=${e => this.firstName = e.target.value}
            .value=${this.firstName}
            id='inp-first-name' 
            type="text" 
            placeholder="Enter a first name">
        </div>
      </div>
      <div class="field-container">
        <label for='inp-middle-name'>Middle Name</label>
        <div class='text-input-container'>
          <input 
            @input=${e => this.middleName = e.target.value}
            .value=${this.middleName}
            id='inp-middle-name' 
            type="text" 
            placeholder="Enter a middle name">
        </div>
      </div>
      <div class="field-container">
        <label for='inp-last-name'>Last Name</label>
        <div class='text-input-container'>
          <input 
            @input=${e => this.lastName = e.target.value}
            .value=${this.lastName}
            id='inp-last-name' 
            type="text" 
            placeholder="Enter a last name">
        </div>
      </div>
      <div class="checkbox">
        <input 
          @input=${() => this.isDName = !this.isDName} 
          id="inp-isDName" 
          type="checkbox" 
          .checked=${this.isDName}>
        <label for="inp-isDName">Query Online Directory</label>
      </div>
    </div>
  `;
}
