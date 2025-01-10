import { html } from 'lit';

/**
 * @description Main render function for this element
 * @returns {TemplateResult}
 */
export function render() {
  return html`

   <div class="l-3col l-3col--25-50-25">
        <div class="l-second panel o-box">
            <div class="l-container">
                <div class="panel o-box">

                <h2 class='heading--underline' ?hidden=${!this.uploadWidgetTitle}>${this.uploadWidgetTitle}</h2>

                <p style="margin-bottom:30px;">Upload the most recent csv for the organizational chart here.  
                Make sure to use the format which includes headers and the required 
                columns: <br />(Lived Name, EE ID, Email, Notes, Department Name, Working Title, Appointment Type Code, Supervisor ID).
                </p>

                <form style="margin:85px 0px 85px 0;" id="csvForm" @submit=${this._onSubmitCSV}>
                    <input type="file" style="margin-bottom:70px;" id="UploadFile"  class="btn btn--input" accept=".csv" @change=${e => this._onCSV(e.target.files[0])} />
                    <input id="uploadButton" class="btn btn--block btn--alt" type="submit" value="submit" />
                </form>

                </div>
            </div>
            
        </div>

    </div>


`;}
