import { html } from 'lit';

/**
 * @description Render function for ucdlib-employee-search
 * @returns {TemplateResult}
 */
export function render() {
  return html`
    <div>
      <div class="field-container">
        <label>Existing Employee Search</label>
          <input
            @input=${(e) => this.name = e.target.value}
            .value=${this.name}
            type="text">
        </div>
    </div>

`;}
