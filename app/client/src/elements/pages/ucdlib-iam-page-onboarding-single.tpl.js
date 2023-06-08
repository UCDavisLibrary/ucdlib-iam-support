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
        <div class='category-brand__background-light-gold o-box u-space-mb'>
          <div class="panel panel--icon panel--icon-custom ${this.isActiveStatus ? 'panel--icon-secondary' : 'panel--icon-quad'} o-box background-transparent">
            <h2 class="panel__title u-space-mb"><span class="panel__custom-icon fas ${this.isActiveStatus ? 'fa-check-circle' : 'fa-spinner'}"></span>Status</h2>
            <div class='primary fw-bold'>${this.status}</div>
            <div class='primary'>${this.statusDescription}</div>
            <a class='icon icon--circle-arrow-right u-space-mt pointer' @click=${this.openReconModal} ?hidden=${!this.missingUid}>Reconcile Manually</a>
          </div>
        </div>
        <ucdlib-rt-history .ticketId=${this.rtTicketId}></ucdlib-rt-history>
        <a href=${this.RtModel.makeTicketUrl(this.facilitiesRtTicketId)} ?hidden=${!this.facilitiesRtTicketId} class="focal-link category-brand--cabernet u-space-mb">
          <div class="focal-link__figure focal-link__icon">
            <i class="fas fa-broom fa-2x"></i>
          </div>
          <div class="focal-link__body">
            <strong>View Facilities RT Ticket</strong>
          </div>
        </a>
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
        style="padding-left:0;padding-right:0;"
        type='button'
        class="btn btn--alt btn--block u-space-mt"
        ?disabled=${!this.reconId}>Reconcile Record
      </button>
    </div>
  </ucdlib-iam-modal>
`;}
