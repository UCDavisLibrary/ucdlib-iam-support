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
      <form @submit=${this._onSubmit} aria-label='Search for a Separation Request person'>
        <ucdlib-pages selected=${this.searchParam}>
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
          <p class='results-label'>Select an Separation Request:</p>
          ${this.results.map(r => html`
            <a href="/separation/${r.id}" class="media-link link" @click=${() => this._onSelect(r)}>
                <div class='media-link__body'>
                    <h3 class="heading--highlight">${r.additional_data.employeeFirstName} ${r.additional_data.employeeLastName}</h3>
                    ${r.additional_data.employeeId ? html`
                        <div><strong>Employee Id: </strong><span>${r.additional_data.employeeId}</span></div>
                    ` : html``}
                    ${r.separation_date ? html`
                        <div><strong>Separation Date: </strong><span>${r.separation_date}</span></div>
                    ` : html``}
                    ${r.rt_ticket_id ? html`
                        <div><strong>RT Ticket ID: </strong><span>${r.rt_ticket_id}</span></div>
                    ` : html``}
                    ${r.submitted ? html`
                        <div><strong>Date Submitted: </strong><span>${new Date(r.submitted).toDateString()}</span></div>
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
