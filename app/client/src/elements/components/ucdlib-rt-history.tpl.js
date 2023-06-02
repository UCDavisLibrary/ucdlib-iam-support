import { html } from 'lit';

/**
 * @description Main render function for this element
 * @returns {TemplateResult}
 */
export function render() {
  return html`
  <div class='category-brand__background-light-gold o-box u-space-mb'>
    <div class="panel panel--icon panel--icon-custom panel--icon-redbud o-box background-transparent">
      <h2 class="panel__title u-space-mb"><span class="panel__custom-icon fas fa-comment"></span>RT Ticket</h2>
      <section>
        ${this.transactions.length ? html`
          ${this.transactions.map(t => html`
            <div class='u-space-mb'>
              <div class='rt-history-text'>${t.text}</div>
              <div class='rt-history-created'>${t.created}</div>
            </div>
          `)}
          <a class='icon icon--circle-arrow-right' href='https://rt.lib.ucdavis.edu/Ticket/Display.html?id=${this.ticketId}'>View Ticket</a>
        ` : html`
          <p>Unable to load RT ticket!</p>
        `}
      </section>
    </div>
  </div>
`;}
