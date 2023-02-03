import { html, css } from 'lit';

export function styles() {
  const elementStyles = css`
    :host {
      display: block;
    }
  `;

  return [elementStyles];
}

export function render() { 
return html`
  <div class='l-container'>
    <div>
      <ucdlib-iam-search class='u-space-px--medium u-space-py--medium u-align--auto border border--gold'></ucdlib-iam-search>
    </div>
  </div>

`;}