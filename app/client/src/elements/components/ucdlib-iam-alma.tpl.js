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
    .resBox {
      text-align:left;
    }
    .results-list {
      max-width: 1000px;
      overflow-y: scroll;
    }
    .selected-user {
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
  ${this.isLookUp ?
    html`
      <div class='header'>
        <h2 class='heading--underline' ?hidden=${!this.widgetTitle}>${this.widgetTitle}</h2>
      </div>
      <ucdlib-pages selected=${this.page}>
        <div id='form'>
          ${this.wasError ? html`
            <div class="alert alert--error">An error occurred while querying the UC Davis Alma API!</div>
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
          <br />

          <form @submit=${this._onSubmit} aria-label='Search for a person in Alma'>
            <ucdlib-pages selected=${this.searchParam}>
              ${this.renderAlmaIdForm()}
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
              <p class='results-label'>Select an Alma Entry:</p>
              ${this.results.map(user => html`

                <a @click=${() => this._onUserClick(user.primary_id['_text'])} class="media-link link ${this.selectedAlmaId == user.primary_id ? 'selected-user' : ''}">
                  <div class='media-link__body'>
                    <h3 class="heading--highlight">${user.first_name['_text']} ${user.last_name['_text']}</h3>
                    ${user.primary_id['_text'] ? html`
                      <div><strong>Alma ID: </strong><span>${user.primary_id['_text']}</span></div>
                    ` : html``}
                    ${user.status ? html`
                      <div><strong>Status: </strong><span>${user.status['_text']}</span></div>
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
    `: 
    html`
     <div class='header'>
        <h2 class='heading--underline' ?hidden=${!this.widgetTitle}>${this.widgetTitle}</h2>
      </div>
          ${this.renderAlmaEntrySelectionForm()}
      
    `}

`;}

/**
 * @description Renders form for querying by alma id
 * @returns {TemplateResult}
 */
export function renderAlmaIdForm(){
  const view = this.searchParamsByKey.almaId;
  return html`
    <div id=${view.attribute}>
      <div class="field-container">
      <label for='inp-first-name'>Alma ID</label>
        <div class='text-input-container'>
          <input 
            @input=${(e) => this.almaId = e.target.value}
            .value=${this.almaId}
            id=${'inp-'+ view.attribute} 
            type="text" 
            placeholder="Enter an Alma Id...">
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
    </div>
  `;
}


/**
 * @description Renders the page for filling out custom employee data (if not in UCD IAM system yet)
 * @returns 
 */
export function renderAlmaEntrySelectionForm(){
  return html`
  <div id='alma-manual'>
      <section class="brand-textbox category-brand__background category-brand--double-decker u-space-mb--large">
        You can use this form to get Alma Information, and choose which role type they have.  
      </section>
        <div class="panel panel--icon panel--icon-custom o-box panel--icon-pinot">
        <h2 class="panel__title"><span class="panel__custom-icon fas fa-user-tie"></span>Alma Information</h2>
      <div style="text-align:left;">
          <div class="field-container">
            <h6>First Name: ${this.firstName}</h6>
          </div>
          <div class="field-container">
            <h6>Last Name: ${this.lastName}</h6>
          </div>
          <div class="field-container">
            <h6>Alma Id: ${this.userId}</h6>
          </div>
          <div class="field-container">
            <h6>Status: ${this.status}</h6>
          </div>
          <a class='pointer icon icon--circle-arrow-right' @click=${this.openEmployeeInfoModal} .hidden=${this.userEnteredData}>View Entire Employee Record</a>
      </div>
      <br />
      <div style="text-align:left;">
        <h2 class="panel__title"><span class="panel__custom-icon fas fa-sitemap"></span>Employee Roles</h2>          
              <ucd-theme-slim-select  @change=${(e) => this.user_roles = e.detail.map(g => g.value)}>
                      <select multiple>
                        ${this.roles.map(r => html`
                            <option .value=${r.description["_text"]} ?selected=${this.user_roles.includes(r.description["_text"])}> ${r.description["_text"]} - Code ${r.code["_text"]}</option>
                        `)}
                      </select>
              </ucd-theme-slim-select>
      </div>
      <ucdlib-iam-modal id='alma-employee-modal' dismiss-text='Close' content-title='Alma Record'>
        ${!this.userEnteredData ? html`<pre style='font-size:15px;margin:0;'>${JSON.stringify(this.almaRecord.data, null, "  ")}</pre>` : html``}
      </ucdlib-iam-modal>
      <!-- <button type='button' @click=${this._onAlmaFormSubmit} class="btn btn--block btn--alt btn--search">Next</button> -->
    </div>

  </div>

  `;
}
// .value=${r.code["_text"]} 
