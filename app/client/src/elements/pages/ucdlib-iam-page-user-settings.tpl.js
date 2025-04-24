import { html } from 'lit';

export function render() { 
return html`
  <form @submit=${this._onEditSubmit}>
    <div class="l-container">
      <div class="l-shrink panel o-box">
        <h2 class='heading--underline'>RT Functionality</h2>
        <fieldset class="checkbox">
          <ul class="list--reset">
            <li>
              <input id="direct-reports" 
                name="direct-reports" 
                type="checkbox" 
                ?disabled=${this.updateInProgress}
                ?checked=${this.enableDirectReportNotification}
                @change=${this.handleDirectReportChange}>
              <label for="direct-reports">All Direct Reports Notification</label>
            </li>
          </ul>
        </fieldset>


        <button
          class='btn btn--primary'
          ?disabled=${this.updateInProgress || this.noChange}
          type='submit'>
          <span ?hidden=${!this.updateInProgress} class='u-space-mr--small'><i class='fas fa-circle-notch fa-spin'></i></span>
          <span>Update</span>
        </button>
      </div>
    </div>
  </form>

`;}