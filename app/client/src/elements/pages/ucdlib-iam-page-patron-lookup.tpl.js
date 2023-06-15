import { html } from 'lit';

/**
 * @description main render function
 * @returns {TemplateResult}
 */
export function render() {
  return html`
  <div class='l-container u-space-pb'>
    <ucdlib-pages selected=${this.page}>
      ${this.renderHome()}
      ${this.renderSubmissionForm()}
      ${this.renderManualEntryForm()}
      ${this.renderTransferForm()}
      <div id='obn-lookup'>
        <ucdlib-iam-search
          @select=${e => this._onEmployeeSelect(e.detail.status)}
          search-param='employee-id'
          class='u-space-px--medium u-space-py--medium u-align--auto border border--gold'>
        </ucdlib-iam-search>
      </div>
    </ucdlib-pages>
    <ucdlib-iam-modal id='obn-employee-modal' dismiss-text='Close' content-title='Employee Record'>
      ${!this.userEnteredData ? html`<pre style='font-size:15px;margin:0;'>${JSON.stringify(this.iamRecord.data, null, "  ")}</pre>` : html``}
    </ucdlib-iam-modal>
    <ucdlib-iam-modal id='obn-custom-supervisor' dismiss-text='Close' content-title='Set a Custom Supervisor' auto-width>
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
 * @description Renders homepage for this element
 * @returns {TemplateResult}
 */
export function renderHome(){
  return html`
  <div id='obn-home'>
    <div class="priority-links">
      <div class="priority-links__item">
        <a href="#lookup" class="vertical-link vertical-link--circle category-brand--tahoe">
          <div class="vertical-link__figure">
            <i class="vertical-link__image fas fa-search fa-3x"></i>
          </div>
          <div class="vertical-link__title">
            Search UC Davis Directory <br> <span class='fw-light'>(for most cases)</span>
          </div>
        </a>
      </div>
      <div class="priority-links__item">
        <a href="#manual" class="vertical-link vertical-link--circle category-brand--delta">
          <div class="vertical-link__figure">
            <i class="vertical-link__image fas fa-pen fa-3x"></i>
          </div>
          <div class="vertical-link__title">
            Manually Enter Employee <br> <span class='fw-light'>(for special cases)</span>
          </div>
        </a>
      </div>
      <div class="priority-links__item">
        <a href="#transfer" class="vertical-link vertical-link--circle category-brand--cabernet">
          <div class="vertical-link__figure">
            <i class="vertical-link__image fas fa-random fa-3x"></i>
          </div>
          <div class="vertical-link__title">
            Employee Transfer <br> <span class='fw-light'>(from another Library Unit)</span>
          </div>
        </a>
      </div>
    </div>
  </div>
  `;
}

/**
 * @description Renders the main submission form for this element
 * @returns {TemplateResult}
 */
export function renderSubmissionForm(){
  return html`
  <div id='obn-submission'>
    <form class='form-single-col' @submit=${this._onSubmit}>
      <div ?hidden=${!this.hasMultipleAppointments}>
        <div class="panel panel--icon panel--icon-custom o-box panel--icon-double-decker">
          <h2 class="panel__title"><span class="panel__custom-icon fas fa-exclamation-circle"></span>Appointment</h2>
          <section>
            <p class='double-decker'>This employee has more than one appointment. Please select a primary appointment:</p>
            <div class="field-container">
              <label for="obn-appointments">Appointment</label>
              <select id="obn-appointments" @input=${(e) => this._onAppointmentSelect(e.target.value)}>
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
          <h2 class="panel__title"><span class="panel__custom-icon fas fa-briefcase"></span>Library Position</h2>
          <section>
            <div class="field-container">
              <label for="obn-title">Position Title <abbr title="Required">*</abbr></label>
              <input id='obn-title' type="text" .value=${this.positionTitle} required @input=${e => this.positionTitle = e.target.value}>
            </div>
            <div class="field-container">
              <label for="obn-departments">Department <abbr title="Required">*</abbr></label>
              <select id="obn-departments" required @input=${(e) => this.departmentId = e.target.value} .value=${this.departmentId || ''}>
                <option value="" ?selected=${!this.departmentId}>-- Please choose a department --</option>
                ${this.groups.filter(g => g.partOfOrg).map(g => html`
                  <option value=${g.id} ?selected=${this.departmentId == g.id}>${g.name}</option>
                `)}
              </select>
            </div>
            <div class="checkbox">
              <ul class="list--reset">
                <li>
                  <input id="obn-is-dept-head" type="checkbox" @input=${() => this.isDeptHead = !this.isDeptHead} .checked=${this.isDeptHead}>
                  <label for="obn-is-dept-head">Is Department Head</label>
                </li>
              </ul>
            </div>
            <div class="field-container">
              <label>Groups</label>
              <ucd-theme-slim-select @change=${(e) => this.groupIds = e.detail.map(g => g.value)}>
                <select multiple>
                  ${this.groups.filter(g => !g.partOfOrg).map(g => html`
                    <option .value=${g.id} ?selected=${this.groupIds.includes(`${g.id}`)}>${g.name}</option>
                  `)}
                </select>
              </ucd-theme-slim-select>
            </div>
            <div class="field-container">
              <label for="obn-start-date">Start Date <abbr title="Required">*</abbr></label>
              <input id='obn-start-date' type="date" required .value=${this.startDate} @input=${(e) => {this.startDate = e.target.value;}}>
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
            <label for="obn-supervisor">Supervisor</label>
            <input id='obn-supervisor' type="text" .value=${this.supervisor.fullName} disabled >
          </div>
          <div class="checkbox">
            <ul class="list--reset">
              <li>
                <input id="obn-skip-supervisor" type="checkbox" @input=${() => this.skipSupervisor = !this.skipSupervisor} .checked=${this.skipSupervisor}>
                <label for="obn-skip-supervisor">Do not notify supervisor</label>
              </li>
            </ul>
          </div>
          <div class="field-container" ?hidden=${this.skipSupervisor}>
            <label for="obn-supervisor-email">Supervisor Email for RT Ticket</label>
            <input id='obn-supervisor-email' type="text" @input=${e => this.supervisorEmail = e.target.value} .value=${this.supervisorEmail} >
          </div>
        </section>
      </div>
      <div class="panel panel--icon panel--icon-custom o-box panel--icon-poppy">
        <h2 class="panel__title"><span class="panel__custom-icon fas fa-sticky-note"></span>Additional Information</h2>
        <section>
          <div class="field-container">
            <label for="obn-notes">Notes</label>
            <textarea id='obn-notes' rows="8" cols="48"  @input=${e => this.notes = e.target.value} .value=${this.notes}></textarea>
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
 * @description Renders the page for filling out custom employee data (if not in UCD IAM system yet)
 * @returns
 */
export function renderManualEntryForm(){
  return html`
  <div id='obn-manual'>
    <div class='form-single-col'>
      <section class="brand-textbox category-brand__background category-brand--secondary u-space-mb--large">
        Access to most Library applications and services will be delayed until a UC Davis computing account is successfully provisioned.
      </section>
      <div class="panel panel--icon panel--icon-custom o-box panel--icon-pinot">
        <h2 class="panel__title"><span class="panel__custom-icon fas fa-user-tie"></span>Employee</h2>
        <section>
          ${this.renderEmployeeForm()}
        </section>
      </div>
      ${this.renderSupervisorSelectPanel()}
      <button type='button' @click=${this._onManualFormSubmit} ?disabled=${this.manualFormDisabled} class="btn btn--block btn--alt btn--search">Next</button>
    </div>

  </div>
  `;
}

/**
 * @description Renders the page panel for selecting a supervisor
 * @returns {TemplateResult}
 */
export function renderSupervisorSelectPanel(){
  let title = 'Library Supervisor';
  let description = '';
  if ( this.page === 'obn-transfer' ) {
    title = 'New Library Supervisor';
    description = 'If applicable, select the new supervisor for this employee:';
  }

  return html`
    <div class="panel panel--icon panel--icon-custom o-box panel--icon-delta">
      <h2 class="panel__title"><span class="panel__custom-icon fas fa-sitemap"></span>${title}</h2>
      <section>
        <p ?hidden=${!description}>${description}</p>
        <ucdlib-iam-search
          @select=${e => this._onSupervisorSelect(e.detail.status)}
          search-param='employee-id'
          class='u-space-px--medium u-space-py--medium u-align--auto border border--gold'>
        </ucdlib-iam-search>
      </section>
    </div>
  `;
}

/**
 * @description Renders the form of employee details
 * @returns {TemplateResult}
 */
export function renderEmployeeForm(){
  const isSub = this.page == 'obn-submission';
  const disabled = (!this.userEnteredData && isSub);
  return html`
    <div class="field-container">
      <label for="obn-first-name">First Name</label>
      <input id='obn-first-name' type="text" .value=${this.firstName} ?disabled=${disabled} @input=${e => this.firstName = e.target.value}>
    </div>
    <div class="field-container">
      <label for="obn-last-name">Last Name</label>
      <input id='obn-last-name' type="text" .value=${this.lastName} ?disabled=${disabled} @input=${e => this.lastName = e.target.value}>
    </div>
    <div ?hidden=${isSub} class='double-decker u-space-mt--large u-space-mb--small'>
      If at least one of the following identifier fields is not provided,
      the employee record must be manually reconciled with the UC Davis IAM system after submission.
    </div>
    <div class="field-container">
      <label for="obn-employee-id">Employee Id</label>
      <input id='obn-employee-id' type="text" .value=${this.employeeId} ?disabled=${disabled} @input=${e => this.employeeId = e.target.value}>
    </div>
    <div class="field-container">
      <label for="obn-user-id">Kerberos</label>
      <input id='obn-user-id' type="text" .value=${this.userId} ?disabled=${disabled} @input=${e => this.userId = e.target.value}>
    </div>
    <div class="field-container">
      <label for="obn-email">UC Davis Email</label>
      <input id='obn-email' type="text" .value=${this.email} @input=${e => this.email = e.target.value}>
    </div>
  `;
}

/**
 * @description Renders the form for transferring an employee within the library
 * @returns {TemplateResult}
 */
export function renderTransferForm(){
  return html`
  <div id='obn-transfer'>
    <div class='form-single-col'>
      <div class="panel panel--icon panel--icon-custom o-box panel--icon-pinot">
        <h2 class="panel__title"><span class="panel__custom-icon fas fa-user-tie"></span>Employee</h2>
        <section>
          <ucdlib-employee-search
            class='u-space-mb'
            @status-change=${this._onTransferEmployeeStatusChange}>
          </ucdlib-employee-search>
          <div ?hidden=${!this.hasTransferEmployee}>
            <div><span class='fw-bold primary'>Name: </span>${this.transferEmployee.firstName || ''} ${this.transferEmployee.lastName || ''}</div>
            <div><span class='fw-bold primary'>Title: </span>${this.transferEmployee.title || ''}</div>
            <div>
              <span class='fw-bold primary'>Department: </span>
              ${(this.transferEmployee.groups || []).filter(g => g.partOfOrg).map((g, i, arr) => html`<span>${g.name}${arr.length > i+1 ? ', ' : ''}</span>`)}
            </div>
            <div>
              <span class='fw-bold primary'>Supervisor: </span>
              ${this.transferEmployee.supervisor?.firstName || ''} ${this.transferEmployee.supervisor?.lastName || ''}
            </div>
          </div>
        </section>
      </div>
      <div ?hidden=${!this.hasTransferEmployee}>
        ${this.renderSupervisorSelectPanel()}
      </div>
      <button type='button' @click=${this._onTransferFormSubmit} ?disabled=${!this.hasTransferEmployee} class="btn btn--block btn--alt">Next</button>
    </div>
  </div>
  `;
}
