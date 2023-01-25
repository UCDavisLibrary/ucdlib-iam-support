import { html } from 'lit';

export function render() { 
return html`
<ucdlib-pages selected=${this.page}>
  <div id='loading'>hello there</div>
</ucdlib-pages>

`;}