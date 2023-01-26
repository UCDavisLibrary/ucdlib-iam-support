import { html } from 'lit';

/**
 * @description Template to be rendered
 * @returns TemplateResult 
 */
export function render() { 
  return html`
  <ucdlib-pages selected=${this.page}>
    <div id='loading'>hello there</div>
  </ucdlib-pages>

`;}