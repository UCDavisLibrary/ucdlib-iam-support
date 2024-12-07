import { html } from 'lit';

/**
 * @description Main render function
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
        <!-- <div class="l-second panel o-box">

            <div class="l-container">
                <div class="panel o-box">
                    <h2 class='heading--underline' ?hidden=${!this.downloadWidgetTitle}>${this.downloadWidgetTitle}</h2>

                    <form action="#">
                    <p>Download the most recent csv from the IAM system here. 
                        Gives general information of employees in library organization. <br />
                        Contact Financial Administration for official CSV through the accounting 
                        database: <a href="fillinemail@ucdavis.edu">fillinemail@ucdavis.edu</a>
                    </p>
                        <fieldset class="radio">
                            <legend>Choose File Type</legend>
                            <ul id="fileList" class="list--reset">
                            <li><input @input=${() => this.onInput('csv')} id="csv" name="radio" type="radio" class="radio" ?checked=${this.fileType == 'csv'}><label for="csv">CSV</label></li>
                            <li><input @input=${() => this.onInput('excel')} id="excel" name="radio" type="radio" class="radio" ?checked=${this.fileType == 'excel'}><label for="excel">Excel</label></li>
                            </ul>
                        </fieldset>
                    </form>
                    <h5 id="loading-orgchart" style="display:none;">Loading Data...</h5>
                    <button id="download-orgchart" type='button' @click=${this._downloadOrgChart} class="btn btn--block btn--alt" disabled>Download Data Source</button>

                </div>
            </div>
                
        </div> -->
    </div>
  
`;}