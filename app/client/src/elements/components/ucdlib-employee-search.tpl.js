import { html } from 'lit';

/**
 * @description Render function for ucdlib-employee-search
 * @returns {TemplateResult}
 */
export function render() {
  return html`
    <div>
      <div>
        <div class="field-container emp-search-top">
          <label ?hidden=${this.hideLabel}>${this.labelText}</label>
          <div class='emp-search-bar'>
            <input
              @input=${(e) => this.query = e.target.value}
              @focus=${() => this.isFocused = true}
              @blur=${() => this._onBlur()}
              .value=${this.selectedText ? this.selectedText : this.query}
              type="text">
              <div class='emp-search-icon'>
                <div ?hidden=${this.status != 'idle'} >
                  <i class='fas fa-search'></i>
                </div>
                <div ?hidden=${this.status != 'searching'}>
                  <i class="fas fa-circle-notch fa-spin"></i>
                </div>
                <div ?hidden=${this.status != 'no-results'}>
                  <i class="fas fa-exclamation double-decker"></i>
                </div>
                <div ?hidden=${this.status != 'selected'}>
                  <i class="fas fa-check quad"></i>
                </div>
              </div>
          </div>
        </div>
      </div>
      <div class='emp-search-results-parent'>
        <div class='emp-search-results' ?hidden=${!this.showDropdown}>
          <div>
          ${this.results.map(result => html`
            <div class='emp-search-result pointer' @click=${() => this._onSelect(result)}>
              ${this._renderResult(result)}
            </div>
          `)}
          </div>
          <div class='muted emp-search-more' ?hidden=${!this.resultCtNotShown}>
            And ${this.resultCtNotShown} more employees... <br> Try refining your search.
          </div>
        </div>
      </div>
      <div class='brand-textbox u-space-mt--small' ?hidden=${this.status != 'no-results' || !this.isFocused }>No results matched your search!</div>
    </div>

`;}
