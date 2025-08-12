import { html } from 'lit';

/**
 * @description Main render function
 * @returns {TemplateResult}
 */
export function render() {
  return html`
  <div class="panel panel--icon panel--icon-custom o-box panel--icon-${this.brandColor}">
    <h2 class="panel__title">
      <span class="panel__custom-icon fas ${this.panelIcon}"></span>
      <span>${this.panelTitle}</span>
    </h2>
    ${this._records.length ? html`
      <div>
        ${this._records.map(r => html`
          <div class='ob-row o-box o-box--medium'>
            <div class='ob-name u-space-mr'>
              <h3 class='vm-teaser__title'>
                <a href="/onboarding/${r.id}">${r.additionalData.employeeFirstName} ${r.additionalData.employeeLastName}</a>
              </h3>
              <ul class="u-space-mb--small list--pipe">
                <li>${r.libraryTitle}</li>
                <li>${r.departmentName}</li>
              </ul>
              <div class="text--smaller"><strong>Start Date: </strong>${this.fmtDate(r.startDate)}</div>
            </div>
            <div class='ob-status'>${r.statusName}</div>
          </div>
        `)}
      </div>
    ` : html`
      <div class='no-results'>
        <i class="fas fa-exclamation-circle ${this.brandColor} u-space-mr--small"></i>
        <div>${this.noResultsMessage}</div>

      </div>
    `}
  </div>
`;}
