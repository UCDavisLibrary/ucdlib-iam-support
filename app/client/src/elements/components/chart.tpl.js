import { html, css } from 'lit';

export function styles() {
  const elementStyles = css`
    :host {
      display: block;
    }

    .btn--options {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: auto;
      min-width: 10ch;
      min-height: 2.5em;
      margin-bottom: 0;
      padding: 0.625em 1em;
      border: 1px solid #b0d0ed;
      background-color: transparent;
      color: #022851;
      cursor: pointer;
      font-family: inherit;
      font-weight: 1100;
      line-height: 1.1;
      text-align: center;
      text-decoration: none;
      padding-right: 1.5em;
      padding-left: 0.75em;
      transition: 0.2s;
      border-color: transparent;
      background-color: #dbeaf7;
      font-size: 1.2rem;
    }
    .btn--options:hover, .btn--options:focus {
      color: #ffbf00;
      text-decoration: none;
      background-color: #022851;
    }
    .btn--options:focus {
      border-color: transparent;
      box-shadow: 0 0 0 3px #022851;
      outline-color: transparent;
      outline-style: solid;
    }
    .category-brand__background .btn--alt3, .dark-background .btn--alt3 {
      border-color: var(--category-brand-contrast-color);
      color: var(--category-brand-contrast-color);
    }
    .btn--options:before {
      width: 1em;
      color: var(--btn-arrow-color);
      content: "\F054";
      font-family: "Font Awesome 5 Free";
      font-size: 0.75em;
      font-weight: 1100;
      opacity: 0;
      transform: translateX(-100%);
      transition: 0.2s all ease-out;
    }
    .btn--options:hover {
      opacity: 1
    }
  `;

  return [elementStyles];
}

export function render() { 
return html`
 <div class="orgChart">
        <div class="org-options" style="text-align:center;margin:50px 0">
                <button title="Fit to Screen" class="btn--options" @click=${this.fitOrg}>&#x2302;</button>
                <button title="Expand Out Chart" class="btn--options" @click="${this.expandOrg}">&#8615;</button>
                <button title="Collapse Chart" class="btn--options" @click="${this.collapseOrg}">&#8613;</button>
                <button title="Zoom In" class="btn--options" @click="${this.zoomIn}">&#10529;</button>
                <button title="Zoom Out" class="btn--options" @click="${this.zoomOut}">&#10530;</button>
        </div>


        <div class='chart-container' style="padding-top:10px; margin:0;"></div>
    </div>
`;}
