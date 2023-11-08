import { html } from 'lit';
import DtUtils from "@ucd-lib/iam-support-lib/src/utils/dtUtils.js";


/**
 * @description Main render function
 * @returns {TemplateResult}
 */
export function render() {
  return html`
  <div class="panel panel--icon panel--icon-custom o-box panel--icon-${this.brandColor}">
    <h2 class="panel__title"><span class="panel__custom-icon fas ${this.panelIcon}"></span>${this.panelTitle}</h2>

    ${this._records.length ? html`
        <div>
          ${this._records.map(r => html`
              <div class='sp-row o-box o-box--medium'>
                <div class='sp-name u-space-mr'>
                  <h3 class='vm-teaser__title'>
                    <a href="/separation/${r.id}">${r.additionalData.employeeFirstName} ${r.additionalData.employeeLastName}</a>
                  </h3>
                  <ul class="u-space-mb--small list--pipe">
                    <li><strong>IAM ID: </strong>${r.iamId}</li>
                    <li><strong>RT Ticket ID: </strong>${r.rtTicketId}</li>
                  </ul>
                  ${r.separationDate ? html`
                    <div class="text--smaller"><strong>Separation Date: </strong>${DtUtils.fmtDatetime(r.separationDate, {dateOnly: true})}</div>
                  ` : html``}
                </div>

                <div class='sp-status'>${r.statusName}</div>
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
