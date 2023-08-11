import { html } from 'lit';

/**
 * @description Main render function for this element
 * @returns {TemplateResult}
 */
export function render() {
  return html`
  <div class='l-container u-space-pb'>
    <div class='l-basic--flipped'>
      <div class="l-content">
        <div class="panel panel--icon panel--icon-custom o-box panel--icon-quad">
          <h2 class="panel__title"><span class="panel__custom-icon fas fa-briefcase"></span>Library Position</h2>
            <div><label class='u-inline'>Title:</label> ${this.libraryTitle}</div>
            <div><label class='u-inline'>Department:</label> ${this.department}</div>
            <div><label class='u-inline'>Start Date:</label> ${this.startDate}</div>
        </div>
        <div class="panel panel--icon panel--icon-custom o-box panel--icon-delta">
          <h2 class="panel__title"><span class="panel__custom-icon fas fa-sitemap"></span>Supervisor</h2>
          <div><label class='u-inline'>Name:</label> ${this.supervisorName}</div>
          <div><label class='u-inline'>IAM ID:</label> ${this.supervisorId}</div>
        </div>
        <div class="panel panel--icon panel--icon-custom o-box panel--icon-poppy" ?hidden=${!this.notes}>
          <h2 class="panel__title"><span class="panel__custom-icon fas fa-sticky-note"></span>Additional Information</h2>
          <div>${this.notes}</div>
        </div>
        <div class="panel panel--icon panel--icon-custom o-box panel--icon-pinot" ?hidden=${!this.isTransfer}>
          <h2 class="panel__title"><span class="panel__custom-icon fas fa-random"></span>Previous Library Position</h2>
          <section>
            <p>This is a transfer from another library unit:</p>
            <div><label class='u-inline'>Title:</label> ${this.previousPosition.title || ''}</div>
            <div>
              <label class='u-inline'>Department:</label>
              <span>${(this.previousPosition.groups || []).find(g => g.partOfOrg)?.name || ''}</span>
            </div>
            <div>
              <label class='u-inline'>Supervisor:</label>
              <span>${this.previousPosition.supervisor?.firstName || ''} ${this.previousPosition.supervisor?.lastName || ''}</span>
            </div>
          </section>
        </div>
      </div>
      <div class="l-sidebar-second">
        <a href="/permissions/onboarding/${this.requestId}" class="focal-link category-brand--poppy u-space-mb">
          <div class="focal-link__figure focal-link__icon">
            <i class="fas fa-lock-open fa-2x"></i>
          </div>
          <div class="focal-link__body">
            <strong>Request Permissions</strong>
          </div>
        </a>
        <a class="focal-link category-brand--quad u-space-mb pointer" ?hidden=${this.hideBackgroundCheckButton} @click=${this.openBackgroundCheckModal}>
          <div class="focal-link__figure focal-link__icon">
            <i class="fas fa-check fa-2x"></i>
          </div>
          <div class="focal-link__body">
            <strong>${this.sentBackgroundCheck ? 'Background Check Notification' : 'Send Background Check Notification'}</strong>
          </div>
        </a>
        <a href=${this.RtModel.makeTicketUrl(this.facilitiesRtTicketId)} ?hidden=${!this.facilitiesRtTicketId} class="focal-link category-brand--cabernet u-space-mb">
          <div class="focal-link__figure focal-link__icon">
            <i class="fas fa-broom fa-2x"></i>
          </div>
          <div class="focal-link__body">
            <strong>View Facilities RT Ticket</strong>
          </div>
        </a>
        <div class='category-brand__background-light-gold o-box u-space-mb'>
          <div class="panel panel--icon panel--icon-custom ${this.isActiveStatus ? 'panel--icon-secondary' : 'panel--icon-quad'} o-box background-transparent">
            <h2 class="panel__title u-space-mb"><span class="panel__custom-icon fas ${this.isActiveStatus ? 'fa-check-circle' : 'fa-spinner'}"></span>Status</h2>
            <div class='primary fw-bold'>${this.status}</div>
            <div class='primary'>${this.statusDescription}</div>
            <a class='icon icon--circle-arrow-right u-space-mt pointer' @click=${this.openReconModal} ?hidden=${!this.missingUid}>Reconcile Manually</a>
          </div>
        </div>
        <ucdlib-rt-history .ticketId=${this.rtTicketId}></ucdlib-rt-history>
      </div>
    </div>
  </div>
  <ucdlib-iam-modal id='obs-recon-modal' dismiss-text='Close' content-title="Reconcile Record" auto-width hide-footer>
    <ucdlib-iam-search
      @select=${e => this._onReconEmployeeSelect(e.detail.status)}
      search-param='employee-id'
      class='u-space-px--medium u-space-py--medium u-align--auto border border--gold'>
    </ucdlib-iam-search>
    <div>
      <button
        @click=${this._onReconSubmit}
        type='button'
        class="btn btn--alt btn--block u-space-mt border-box"
        ?disabled=${!this.reconId}>Reconcile Record
      </button>
    </div>
  </ucdlib-iam-modal>
  <ucdlib-iam-modal id='obs-background-check' dismiss-text='Close' content-title="Background Check" auto-width hide-footer>
    ${this.sentBackgroundCheck ? html`
      <p>Background check notification has already been sent to:</p>
    ` : html`
      <p>Send background check notification to:</p>
    `}
    <div>
      <div class="u-space-my">
        <ul class="list--reset checkbox">
          <li>
            <input
              id='obs-send-itis-rt'
              type="checkbox"
              @input=${() => this._onBackgroundCheckChange('sendItisRt', '', 'checkbox')}
              .checked=${this.backgroundCheck?.sendItisRt || this.backgroundCheck?.itisRtSent}
              .disabled=${this.sentBackgroundCheck || !this.rtTicketId}
              >
            <label for='obs-send-itis-rt' class='u-inline'>ITIS RT Ticket ${this.backgroundCheck?.itisRtSentTimestamp ? `(Sent ${(new Date(this.backgroundCheck?.itisRtSentTimestamp)).toLocaleString()})` : ''}</label>
          </li>
          <li>
            <input
              id='obs-send-facilities-rt'
              type="checkbox"
              @input=${() => this._onBackgroundCheckChange('sendFacilitiesRt', '', 'checkbox')}
              .checked=${this.backgroundCheck?.sendFacilitiesRt || this.backgroundCheck?.sendFacilitiesRt}
              .disabled=${this.sentBackgroundCheck || !this.facilitiesRtTicketId}
              >
            <label class='u-inline' for='obs-send-facilities-rt'>Facilities RT Ticket ${this.backgroundCheck?.facilitiesRtSentTimestamp ? `(Sent ${(new Date(this.backgroundCheck?.facilitiesRtSentTimestamp)).toLocaleString()})` : ''}</label>
            ${!this.facilitiesRtTicketId ? html`<div class='checkbox-detail'>There is no facilities RT ticket associated with this request.</div>` : html``}
          </li>
        </ul>
        <div class="field-container u-space-mt">
          <label>Optional Message:</label>
          <textarea rows="5"  class='border-box' @input=${v => this._onBackgroundCheckChange('message', v.target.value)} .value=${this.backgroundCheck?.message || ''}></textarea>
        </div>
      </div>
    </div>
    <div>
      <button
        @click=${this._onSendBackgroundCheck}
        type='button'
        class="btn btn--alt btn--block u-space-mt--large border-box"
        ?disabled=${this.sentBackgroundCheck || (!this.backgroundCheck?.sendItisRt && !this.backgroundCheck?.sendFacilitiesRt)}>Send Notification
      </button>
    </div>
  </ucdlib-iam-modal>
`;}
