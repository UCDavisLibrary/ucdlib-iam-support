import { html, css } from 'lit';

import normalizeStyles from "@ucd-lib/theme-sass/normalize.css.js";
import headingStyles from "@ucd-lib/theme-sass/1_base_html/_headings.css";
import linkStyles from "@ucd-lib/theme-sass/1_base_html/_links.css.js";
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
    .copy-text {
      margin-top: 1rem;
      display: block;
      cursor: pointer;
      font-weight: 700;
      text-decoration: none;
    }
  `;

  return [
    normalizeStyles,
    headingStyles,
    linkStyles,
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
  <div class="field-container">
    <label >Search for Roles</label>
    <ucd-theme-slim-select  @change=${(e) => this.user_roles = e.detail.map(g => g.value)}>
      <select multiple>
        ${this.roles.map(r => html`
            <option .value=${r.code} ?selected=${this.user_roles.includes(r.description)}> ${r.description} - Code ${r.code}</option>
        `)}
      </select>
    </ucd-theme-slim-select>
    <a class='copy-text' @click=${this.openUserSearchModal}>Or copy roles from an existing Alma user.</a> 
  </div>
  <ucdlib-iam-modal id='user-search-modal' dismiss-text='Close' content-title='Alma User Search'>
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
                  <a @click=${() => this._onUserClick(user.primary_id)} class="media-link link ${this.selectedAlmaId == user.primary_id ? 'selected-user' : ''}">
                    <div class='media-link__body'>
                      <h3 class="heading--highlight">${user.first_name} ${user.last_name}</h3>
                      ${user.primary_id ? html`
                        <div><strong>Alma ID: </strong><span>${user.primary_id}</span></div>
                      ` : html``}
                      ${user.status ? html`
                        <div><strong>Status: </strong><span>${user.status["value"]}</span></div>
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

    </ucdlib-iam-modal>

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



