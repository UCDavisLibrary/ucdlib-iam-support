import { html } from 'lit';

/**
 * @description main render function
 * @returns {TemplateResult}
 */
export function render() {
  return html`
  <div class='l-container u-space-pb'>
    <ucdlib-pages selected=${this.page}>
      ${this.renderSubmissionForm()}
      <div id='sp-lookup'>
        <ucdlib-iam-search
          @select=${e => this._onEmployeeSelect(e.detail.status)}
          search-param='employee-id'
          class='u-space-px--medium u-space-py--medium u-align--auto border border--gold'>
        </ucdlib-iam-search>
      </div>
    </ucdlib-pages>
    <ucdlib-iam-modal id='sp-employee-modal' dismiss-text='Close' content-title='Employee Record'>
      ${!this.userEnteredData ? html`<pre style='font-size:15px;margin:0;'>${JSON.stringify(this.iamRecord.data, null, "  ")}</pre>` : html``}
    </ucdlib-iam-modal>
    <ucdlib-iam-modal id='sp-custom-supervisor' dismiss-text='Close' content-title='Set a Custom Supervisor' auto-width>
      <p>Override the supervisor record for this employee.
        For example, TES employees should have their supervisor set to their library supervisor.
      </p>
      <ucdlib-iam-search
        @select=${e => this._onSupervisorEditSelect(e.detail.status)}
        search-param='employee-id'
        reset-on-select
        class='u-space-px--medium u-space-py--medium u-align--auto border border--gold'>
      </ucdlib-iam-search>
    </ucdlib-iam-modal>
  </div>
`;}


/**
 * @description Renders the main submission form for this element
 * @returns {TemplateResult}
 */
export function renderSubmissionForm(){
  return html`
  <div id='sp-submission'>
    <form class='form-single-col' @submit=${this._onSubmit}>
      <div ?hidden=${!this.hasMultipleAppointments}>
        <div class="panel panel--icon panel--icon-custom o-box panel--icon-double-decker">
          <h2 class="panel__title"><span class="panel__custom-icon fas fa-exclamation-circle"></span>Appointment</h2>
          <section>
            <p class='double-decker'>This employee has more than one appointment. Please select a primary appointment:</p>
            <div class="field-container">
              <label for="sp-appointments">Appointment</label>
              <select id="sp-appointments" @input=${(e) => this._onAppointmentSelect(e.target.value)}>
                ${this.appointments.map((appt, i) => html`
                  <option .value=${i}>${appt.titleDisplayName} - ${appt.apptDeptOfficialName}</option>
                `)}
              </select>
            </div>
          </section>
        </div>
      </div>
      <div>
        <div class="panel panel--icon panel--icon-custom o-box panel--icon-quad">
          <h2 class="panel__title"><span class="panel__custom-icon fas fa-briefcase"></span>Separation Information</h2>
          <section>
            <div class="field-container">
              <label for="sp-separation-date">Date of Separation <abbr title="Required">*</abbr></label>
              <input id='sp-separation-date' type="date" required .value=${this.separationDate} @input=${(e) => {this.separationDate = e.target.value;}}>
            </div>
          </section>
        </div>
      </div>




      <div class="panel panel--icon panel--icon-custom o-box panel--icon-pinot">
        <h2 class="panel__title"><span class="panel__custom-icon fas fa-user-tie"></span>Employee</h2>
        <section>
          ${this.renderEmployeeForm()}
        </section>
        <a class='pointer icon icon--circle-arrow-right' @click=${this.openEmployeeInfoModal} .hidden=${this.userEnteredData}>View Entire Employee Record</a>
      </div>




      <div class="panel panel--icon panel--icon-custom o-box panel--icon-delta">
        <h2 class="panel__title space-between">
          <div><span class="panel__custom-icon fas fa-sitemap"></span><span>Supervisor</span></div>
          <a @click=${this._onSupervisorEdit} class='pointer u-space-ml' title="Set Custom Supervisor"><i class='fas fa-edit'></i></a>
        </h2>
        <section>
          <div class="field-container">
            <label for="sp-supervisor">Supervisor</label>
            <input id='sp-supervisor' type="text" .value=${this.supervisor.fullName} disabled >
          </div>
          <div class="checkbox">
            <ul class="list--reset">
              <li>
                <input id="sp-skip-supervisor" type="checkbox" @input=${() => this.skipSupervisor = !this.skipSupervisor} .checked=${this.skipSupervisor}>
                <label for="sp-skip-supervisor">Do not notify supervisor</label>
              </li>
            </ul>
          </div>
          <div class="field-container" ?hidden=${this.skipSupervisor}>
            <label for="sp-supervisor-email">Supervisor Email for RT Ticket</label>
            <input id='sp-supervisor-email' type="text" @input=${e => this.supervisorEmail = e.target.value} .value=${this.supervisorEmail} >
          </div>
        </section>
      </div>
      <div class="panel panel--icon panel--icon-custom o-box panel--icon-poppy">
        <h2 class="panel__title"><span class="panel__custom-icon fas fa-sticky-note"></span>Additional Information</h2>
        <section>
          <div class="field-container">
            <label for="sp-notes">Notes</label>
            <textarea id='sp-notes' rows="8" cols="48"  @input=${e => this.notes = e.target.value} .value=${this.notes}></textarea>
          </div>
        </section>
      </div>
      <button
          type='submit'
          class="btn btn--block btn--alt btn--search">Submit</button>
      </form>
    </form>
  </div>
  `;
}


/**
 * @description Renders the form of employee details
 * @returns {TemplateResult}
 */
export function renderEmployeeForm(){
  const isSub = this.page == 'sp-submission';
  const disabled = (!this.userEnteredData && isSub);
  return html`
    <div class="field-container">
      <label for="sp-first-name">First Name</label>
      <input id='sp-first-name' type="text" .value=${this.firstName} ?disabled=${disabled} @input=${e => this.firstName = e.target.value}>
    </div>
    <div class="field-container">
      <label for="sp-last-name">Last Name</label>
      <input id='sp-last-name' type="text" .value=${this.lastName} ?disabled=${disabled} @input=${e => this.lastName = e.target.value}>
    </div>
    <div ?hidden=${isSub} class='double-decker u-space-mt--large u-space-mb--small'>
      If at least one of the following identifier fields is not provided,
      the employee record must be manually reconciled with the UC Davis IAM system after submission.
    </div>
    <div class="field-container">
      <label for="sp-employee-id">Employee Id</label>
      <input id='sp-employee-id' type="text" .value=${this.employeeId} ?disabled=${disabled} @input=${e => this.employeeId = e.target.value}>
    </div>
    <div class="field-container">
      <label for="sp-user-id">Kerberos</label>
      <input id='sp-user-id' type="text" .value=${this.userId} ?disabled=${disabled} @input=${e => this.userId = e.target.value}>
    </div>
    <div class="field-container">
      <label for="sp-email">UC Davis Email</label>
      <input id='sp-email' type="text" .value=${this.email} @input=${e => this.email = e.target.value}>
    </div>
  `;
}


