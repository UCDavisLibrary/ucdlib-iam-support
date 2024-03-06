import { html } from 'lit';

/**
 * @description Main render function
 * @returns {TemplateResult}
 */
export function render() { 
  return html`
    <form action="#">
        <fieldset class="radio">
            <legend>Choose File Type</legend>
            <ul class="list--reset">
            <li><input @input=${() => this.onInput('csv')} id="csv" name="radio" type="radio" class="radio" ?checked=${this.fileType == 'csv'}><label for="csv">CSV</label></li>
            <li><input @input=${() => this.onInput('excel')} id="excel" name="radio" type="radio" class="radio" ?checked=${this.fileType == 'excel'}><label for="excel">Excel</label></li>
            </ul>
        </fieldset>
    </form>
    <h5 id="loading-orgchart" style="display:none;">Loading Data...</h5>
    <button id="download-orgchart" type='button' @click=${this._downloadOrgChart} class="btn btn--block btn--alt" disabled>Download Data Source</button>

`;}
