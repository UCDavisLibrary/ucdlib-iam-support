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

/**
 * @description shadow styles
 * @returns 
 */
export function styles() {
  const elementStyles = css`
    :host {
      display: block;
      padding: 1rem;
      max-width: 500px;
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
    elementStyles
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
          ${this.renderEmailForm()}
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
                ${person.iamId ? html`
                  <div><strong>IAM Id: </strong><span>${person.iamId}</span></div>
                ` : html``}
                ${person.userID ? html`
                  <div><strong>Kerberos: </strong><span>${person.userID}</span></div>
                ` : html``}
              </div>
            </a>
          `)}
       </div>
      ` : html`
        <div class="alert">No people matched your search.</div>
      `}
    </div>
  </ucdlib-pages>
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
 * @description Renders form for querying by email
 * @returns {TemplateResult}
 */
export function renderEmailForm(){
  const view = this.searchParamsByKey.email;
  return html`
    <div id=${view.attribute}>
      <div class="field-container">
        <label ?hidden=${!this.hideNav} for=${'inp-'+ view.attribute}>${view.label}</label>
        <div class='text-input-container'>
          <input 
            @input=${(e) => this.email = e.target.value}
            id=${'inp-'+ view.attribute} 
            type="email" 
            placeholder="Enter an email address">
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
          ?checked=${this.isDName}>
        <label for="inp-isDName">Query Online Directory</label>
      </div>
    </div>
  `;
}