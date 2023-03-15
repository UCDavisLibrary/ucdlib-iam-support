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
        <p>TODO: onboarding request deets go here</p>
      </div>
      <div class="l-sidebar-second">
        <a href="/permissions/onboarding/${this.requestId}" class="focal-link category-brand--poppy u-space-mb">
          <div class="focal-link__figure focal-link__icon">
            <i class="fas fa-lock fa-2x"></i>
          </div>
          <div class="focal-link__body">
            <strong>Request Permissions</strong>
          </div>
        </a>
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