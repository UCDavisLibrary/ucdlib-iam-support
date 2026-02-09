import { html } from 'lit';

/**
 * @description Main render function
 * @returns {TemplateResult}
 */
export function render() { 
  return html`
  <section ?hidden=${this.hidden} class="brand-textbox category-brand__background ${this.brandColor ? 'category-brand--' + this.brandColor : ''} brand-textbox--collapsible">
    <div class="brand-textbox__content">${this.message}</div>
    <button class="brand-textbox__button" title="Dismiss Message" @click=${() => this.hidden = true}>Dismiss</button>
  </section>

`;}