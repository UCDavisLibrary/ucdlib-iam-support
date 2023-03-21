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
            <div class='primary'>${this.status}</div>
          </div>
        </div>
        <div class='category-brand__background-light-gold o-box u-space-mb'>
          <div class="panel panel--icon panel--icon-custom panel--icon-redbud o-box background-transparent">
            <h2 class="panel__title u-space-mb"><span class="panel__custom-icon fas fa-comment"></span>RT Ticket</h2>
            <section>
              ${this.rtTransactions.length ? html`
                ${this.rtTransactions.map(t => html`
                  <div class='u-space-mb'>
                    <div class='rt-history-text'>${t.text}</div>
                    <div class='rt-history-created'>${t.created}</div>
                  </div>
                `)}
                <a class='icon icon--circle-arrow-right' href='https://rt.lib.ucdavis.edu/Ticket/Display.html?id=${this.rtTicketId}'>View Ticket</a>
              ` : html`
                <p>Unable to load RT ticket!</p>
              `}
            </section>
          </div>
        </div>
      </div>
    </div>
  </div>
`;}