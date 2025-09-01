import { html } from 'lit';

/**
 * @description Primary render function
 * @returns {TemplateResult}
 */
export function render() {
  return html`
    <div class='l-container u-space-pb'>

      <ucdlib-pages selected=${this.page}>
        ${this.renderEmployeeSelect()}
        ${this.renderEmployeeEdit()}
        ${this.renderEmployeeResult()}
      </ucdlib-pages>
    </div>
`;}


/**
 * @description Template for the select employee page
 * @returns {TemplateResult}
 */
export function renderEmployeeSelect(){
  return html`
 
    <div class='form-single-col' id='employee-select'> 
      <h2 class="panel__title"><span class="panel__custom-icon fas fa-user-tie"></span>Search for Current Employee</h2>
      <ucdlib-employee-search
          class='u-space-mb'
          @status-change=${this._onEmployeeStatusChange}>
      </ucdlib-employee-search>
      <div ?hidden=${!this.hasEmployeeRecord}>
        <div><span class='fw-bold primary'>Name: </span>${this.employeeRecord.firstName || ''} ${this.employeeRecord.lastName || ''}</div>
        <div><span class='fw-bold primary'>Title: </span>${this.employeeRecord.title || ''}</div>
        <div><span class='fw-bold primary'>IAM ID: </span>${this.employeeRecord.iamId || ''}</div>
        <div><span class='fw-bold primary'>Kerberos: </span>${this.employeeRecord.userId || ''}</div>
        <div><span class='fw-bold primary'>Employee ID: </span>${this.employeeRecord.employeeId || ''}</div>
        <div>
          <span class='fw-bold primary'>Department: </span>
          ${(this.employeeRecord.groups || []).filter(g => g.partOfOrg).map((g, i, arr) => html`<span>${g.name}${arr.length > i+1 ? ', ' : ''}</span>`)}
        </div>
        <div>
          <span class='fw-bold primary'>Supervisor: </span>
          ${this.employeeRecord.supervisor?.firstName || ''} ${this.employeeRecord.supervisor?.lastName || ''}
          </div>
        </div>
        <br />
      <button type='button' @click=${this._onEmployeeSelect} ?disabled=${!this.hasEmployeeRecord} class="btn btn--block btn--alt">Next</button>
    </div>
  `;
}

/**
 * @description Template for employee discrepancy list
 * @returns {TemplateResult}
 */
export function renderEmployeeDiscrepancy(){
  return html`
    <div ?hidden=${this.discrepancy.length === 0} class='discrepancyList'>
    <h3 class="panel__title u-space-mb--small"><span class="panel__custom-icon fas fa-exclamation-triangle"></span>Active Discrepancies</h3>
    <p>The following section lists active discrepancies for this employee and can be dismissed by an admin.</p>
      ${this.discrepancy.map(dis => html`
        <div class="discrepancyItem
           ${this.dismissDiscrepancyList.includes(dis.id) ? 'active' : ''}
           ${!this.admin ? 'no-hover' : ''}" 
           @click=${this.admin ? () => this._addToDismissDiscrepanciesList(dis) : null}>
           <div class="discrepancy-row">
              <span>
                <h6>${dis.label}</h6>
                <p>${dis.description}</p>
              </span>
            </div>
        </div>
      `)}
      <br ?hidden=${!this.admin}  />
      <button ?hidden=${!this.admin} type='button' @click=${this._dismissDiscrepancies} ?disabled=${this.dismissDiscrepancyList.length === 0} class="btn btn--block btn--alt">Dismiss</button>
    </div>
  `;
}


/**
 * @description Template for the edit employee page
 * @returns {TemplateResult}
 */
export function renderEmployeeEdit(){
  return html`
  <div class='l-container' id='employee-edit'>
    <div class='l-container l-basic' >
        <div class='l-sidebar-first'>
          ${this.renderEmployeeDiscrepancy()}
        </div>
        <div class="l-content">
          <h2 class='u-space-mb--medium'>Employee Information</h2>
          <div class='u-space-mb--large'>
            <h3 class="panel__title u-space-mb--small"><span class="panel__custom-icon fas fa-address-card"></span>UCPath</h3>
            <p>The following information is populated from UCPath and cannot be edited from this application.</p>

            <div class="field-container">
              <label for="update-first-name">First Name</label>
              <input id='update-first-name' type="text" .value=${this.firstName} disabled>
            </div>
            <div class="field-container">
              <label for="update-last-name">Last Name</label>
              <input id='update-last-name' type="text" .value=${this.lastName} disabled>
            </div>
            <div class="field-container">
              <label for="update-employee-id">IAM ID</label>
              <input id='update-employee-id' type="text" .value=${this.iamId} disabled>
            </div>
            <div class="field-container">
              <label for="update-iam-id">Employee ID</label>
              <input id='update-iam-id' type="text" .value=${this.employeeId} disabled>
            </div>
            <div class="field-container">
              <label for="update-user-id">Kerberos</label>
              <input id='update-user-id' type="text" .value=${this.userId} disabled>
            </div>
            <div class="field-container">
              <label for="update-email">UC Davis Email</label>
              <input id='update-email' type="text" .value=${this.email} disabled>
            </div>
          </div>

          <h3 class="panel__title u-space-mb--medium"><span class="panel__custom-icon fas fa-user-tie"></span>Library Position</h3>
            <div class="field-container">
              <label for="update-employee-id">Working Title</label>
              <input id='update-employee-id' type="text" .value=${this.employeeTitle} @input=${e => this.employeeTitle = e.target.value}>
            </div>
            <div class="field-container">
            <label for="update-department">Department</label>
              <ucd-theme-slim-select @change=${(e) =>  this.checkDepartmentHead(e.detail.value, e.detail)}>
                <select id="update-department" .value=${this.departmentId || ''}}>
                    ${this.groups.filter(g => g.partOfOrg).map(g => html`
                        <option value=${g.id} ?selected=${this.departmentId == g.id}>${g.name}</option>
                    `)}
                </select>
              </ucd-theme-slim-select>
            </div>

            <div class="field-container">
              <div class="checkbox">
                <ul class="list--reset">
                  <li>
                    <input id="update-head-department" type="checkbox" @change=${(e) => e.target.checked ? this.alertDepartmentHead(e.target.checked) :  this.unassignDepartmentHead()}  .checked=${this.isHead}>
                    <label for="update-head-department">Is Department Head</label>
                  </li>
                </ul>
              </div>
              <div class='double-decker' ?hidden=${!this.deptHeadConflict} >${this.conflictMessage}</div>
            </div>
            <div class='l-2col'>
              <button type='button' @click=${this.reset} class="l-first u-space-mt btn btn--block btn">Back To Search</button>
              <button type='button' @click=${this.updateEmployee} ?disabled=${this.disabledSubmit} class="l-second u-space-mt btn btn--block btn--alt">Submit</button>
            </div>

        </div>
    </div>
  </div>
    

  `;
}

/**
 * @description Template for the edit employee result page
 * @returns {TemplateResult}
 */
export function renderEmployeeResult(){
  return html`
  <div class='form-single-col' id='employee-result'>
    <h2 class="panel__title"><span class="panel__custom-icon fas fa-user-tie"></span>Employee Updates</h2>
    <div ?hidden=${!this.hasEmployeeRecord}>
        <div><span class='fw-bold primary'>Name: </span>${this.employeeRecord.firstName || ''} ${this.employeeRecord.lastName || ''}</div>
        <div><span class='fw-bold primary'>Title: </span>${this.employeeRecord.title || ''}</div>
        <div><span class='fw-bold primary'>IAM ID: </span>${this.employeeRecord.iamId || ''}</div>
        <div><span class='fw-bold primary'>Kerberos: </span>${this.employeeRecord.userId || ''}</div>
        <div><span class='fw-bold primary'>Employee ID: </span>${this.employeeRecord.employeeId || ''}</div>
        <div>
          <span class='fw-bold primary'>Department: </span>
          ${(this.employeeRecord.groups || []).filter(g => g.partOfOrg).map((g, i, arr) => html`<span>${g.name}${arr.length > i+1 ? ', ' : ''}</span>`)}
        </div>
        <div>
          <span class='fw-bold primary'>Supervisor: </span>
          ${this.employeeRecord.supervisor?.firstName || ''} ${this.employeeRecord.supervisor?.lastName || ''}
          </div>
        </div>
        <div>
          <div><span class='fw-bold primary'>Is Department Head: </span>${this.isHead ? "True": "False"}</div>
        </div>
        <br />
      <button type='button' @click=${this.reset} class="btn btn--block btn--alt">Return To Search</button>
    </div>
  </div>
  `;
}

