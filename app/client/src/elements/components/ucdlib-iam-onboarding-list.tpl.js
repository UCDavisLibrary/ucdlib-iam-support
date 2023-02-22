import { html } from 'lit';

/**
 * @description Main render function
 * @returns {TemplateResult}
 */
export function render() { 
  return html`
  <div class="panel panel--icon panel--icon-custom o-box panel--icon-${this.brandColor}">
    <h2 class="panel__title"><span class="panel__custom-icon fas ${this.panelIcon}"></span>${this.panelTitle}</h2>
  </div>
`;}