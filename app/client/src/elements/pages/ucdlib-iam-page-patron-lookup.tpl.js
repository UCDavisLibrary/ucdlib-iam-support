import { html } from 'lit';
import dtUtls from '@ucd-lib/iam-support-lib/src/utils/dtUtils.js';


/**
 * @description Primary render function
 * @returns {TemplateResult}
 */
export function render() {
  return html`
<div class="l-3col l-3col--25-50-25">
  <div class="l-second panel o-box">

    <div>
        <h2 class='heading--underline' ?hidden=${!this.widgetTitle}>${this.widgetTitle}</h2>
      </div>
      <ucdlib-pages selected=${this.page}>
        <div id='form'>
          ${this.wasError ? html`
          <div class="alert alert--error">An error occurred while querying the UC Davis IAM API!</div>
          ` : html``}
          <nav  ?hidden=${this.hideNav}>
            <label>Search by: </label>
            <select id='search-param' @input=${e => this.searchParam = e.target.value}>
              ${this.navItems.map(item => html`
                <option value=${item.attribute} ?selected=${item.attribute == this.searchParam}>${item.label}</option>
              </li>
              `)}
            </select>
          </nav>
          <br />
          <form @submit=${this._onSubmit} aria-label='Search for a UC Davis person'>
            <ucdlib-pages selected=${this.searchParam}>
              ${this.renderUserIdForm()}
              ${this.renderEmployeeIdForm()}
              ${this.renderStudentIdForm()}
              ${this.renderEmailForm()}
              ${this.renderNameForm()}
            </ucdlib-pages>
            <button
              ?disabled=${this.disableSearch}
              type='submit'
              class="btn btn--block btn--alt btn--search u-space-mt">Search${this.isFetching ? html`<span>ing</span>` : html``}</button>
          </form>
        </div>
        <div  id='results'>
          ${this.results.length ? html`
            <div class='results-list'>
              <p class='results-label'>Select an Employee:</p>
              ${this.results.map(person => html`
                <a @click=${() => this._onPersonClick(person.iamId)} class="media-link link ${this.selectedPersonId == person.iamId ? 'selected-person' : ''}">
                  <div class='media-link__body'>
                    <h3 class="heading--highlight">${person.oFullName}</h3>
                    ${person.employeeId ? html`
                      <div><strong>Employee Id: </strong><span>${person.employeeId}</span></div>
                    ` : html``}
                    ${person.studentId ? html`
                      <div><strong>Student Id: </strong><span>${person.studentId}</span></div>
                    ` : html``}
                  </div>
                </a>
              `)}
          </div>
          <br />
          <button @click=${() => this.page = 'form'} class="btn btn--block btn--alt btn--search">Back To Search</button>
          ` : html`
            <div class="alert">
              <p>No people matched your search.</p>
              <p><a @click=${() => this._onReturn()} class='pointer'>Try another search term.</a></p>
            </div>
          `}
        </div>
        <div id="information">
          <div class="field-container">
            ${this.selectedPersonProfile ? html`
                  <div class="box-row"><div class="box"><h6>General Information for IAM ${this.informationHeaderID}</h6></div><div class="box hide"></div></div>

                  ${this.selectedPersonProfile.oFullName ? html`<div class="box-row"><div class="box"><strong>Name</strong></div><div class="box">${this.selectedPersonProfile.oFullName}</div></div>`:html``}
                  ${this.selectedPersonProfile.studentId ? html`<div class="box-row"><div class="box"><strong>Student ID</strong></div><div class="box">${this.selectedPersonProfile.studentId}</div></div>`:html``}
                  ${this.selectedPersonProfile.employeeId ? html`<div class="box-row"><div class="box"><strong>Employee ID</strong></div><div class="box">${this.selectedPersonProfile.employeeId}</div></div>`:html``}
                  ${this.selectedPersonProfile.userID ? html`<div class="box-row"><div class="box"><strong>Kerberos ID</strong></div><div class="box">${this.selectedPersonProfile.userID}</div></div>`:html``}
                  ${this.selectedPersonProfile.email ? html`<div class="box-row"><div class="box"><strong>Email</strong></div><div class="box">${this.selectedPersonProfile.email}</div></div>`:html``}
                  ${this.alma ? html`<div class="box-row"><div class="box"><strong>Alma</strong></div><div class="box"><a class='pointer icon icon--circle-arrow-right' @click=${this.openAlmaInfoModal}>Alma Record: <strong>${this.alma.id}</strong></a></div></div>`:html``}
                <br />

                  <div class="box-row"><div class="box"><h6>Affiliation for IAM ${this.informationHeaderID}</h6></div><div class="box hide"></div></div>

                  ${this.selectedPersonProfile.isStudent ? html`<div class="box-row"><div class="box"><strong>Is Student</strong></div><div class="box">${this.selectedPersonProfile.isStudent ? html`<p style="text-align:center;color:green;">&#x2713;</p>`:html`<p style="text-align:center;color:red;">&#x2715;</p>`}</div></div>`:html``}
                  ${this.selectedPersonProfile.isEmployee ? html`<div class="box-row"><div class="box"><strong>Is Employee</strong></div><div class="box">${this.selectedPersonProfile.isEmployee ? html`<p style="text-align:center;color:green;">&#x2713;</p>`:html`<p style="text-align:center;color:red;">&#x2715;</p>`} </div></div>`:html``}
                  ${this.selectedPersonProfile.isExternal ? html`<div class="box-row"><div class="box"><strong>Is External</strong></div><div class="box">${this.selectedPersonProfile.isExternal ? html`<p style="text-align:center;color:green;">&#x2713;</p>`:html`<p style="text-align:center;color:red;">&#x2715;</p>`}</div></div>`:html``}
                  ${this.selectedPersonProfile.isFaculty ? html`<div class="box-row"><div class="box"><strong>Is Faculty</strong></div><div class="box">${this.selectedPersonProfile.isFaculty ? html`<p style="text-align:center;color:green;">&#x2713;</p>`:html`<p style="text-align:center;color:red;">&#x2715;</p>`}</div></div>`:html``}
                  ${this.selectedPersonProfile.isStaff ? html`<div class="box-row"><div class="box"><strong>Is Staff</strong></div><div class="box">${this.selectedPersonProfile.isStaff ? html`<p style="text-align:center;color:green;">&#x2713;</p>`:html`<p style="text-align:center;color:red;">&#x2715;</p>`}</div></div>`:html``}
                  ${this.selectedPersonProfile.isHSEmployee ? html`<div class="box-row"><div class="box"><strong>Is HS Employee</strong></div><div class="box">${this.selectedPersonProfile.isHSEmployee ? html`<p style="text-align:center;color:green;">&#x2713;</p>`:html`<p style="text-align:center;color:red;">&#x2715;</p>`}</div></div>`:html``}

                <br />

                ${this.selectedPersonDepInfo ? html`
                  <div class="boxer">
                    <div class="box-row"><!--Headings-->
                      <div class="box"><h6>Department Information for IAM ${this.informationHeaderID}</h6></div>
                      <div class="box hide"></div>
                    </div>

                    ${this.selectedPersonDepInfo.map(dep =>html`
                          <div class="box-row"><div class="box"><strong>Title</strong></div><div class="box">${dep.titleOfficialName ? html`${dep.titleOfficialName} (${dep.titleCode})`: html`<p>Not Listed</p>`}</div></div>
                          <div class="box-row"><div class="box"><strong>Position Type</strong></div><div class="box">${dep.positionType ? html`${dep.positionType} (${dep.positionTypeCode})`: html`<p>Not Listed</p>`}</div></div>
                          <div class="box-row"><div class="box"><strong>Department</strong></div><div class="box">${dep.deptOfficialName ? html`${dep.deptOfficialName} (${dep.deptCode})`: html`<p>Not Listed</p>`}</div></div>
                          <div class="box-row"><div class="box"><strong>Start Date</strong></div><div class="box">${dep.assocStartDate ? html`${dtUtls.fmtDatetime(dep.assocStartDate, true, true)}`: html`<p>Not Listed</p>`}</div></div>
                          <div class="box-row"><div class="box"><strong>End Date</strong></div><div class="box">${dep.assocEndDate ? html`${dtUtls.fmtDatetime(dep.assocEndDate, true, true)}`: html`<p>Indefinite</p>`}</div></div>
                          <div class="box-row"><div class="box"><strong>Admin Title</strong></div><div class="box">${dep.adminDeptOfficialName ? html`${dep.adminDeptOfficialName} (${dep.adminDept})`: html`<p>Not Listed</p>`}</div></div>
                          <div class="box-row"><div class="box"><strong>Appointment</strong></div><div class="box">${dep.apptDeptOfficialName ? html`${dep.apptDeptOfficialName} (${dep.apptDeptCode})`: html`<p>Not Listed</p>`}</div></div>
                    `)}
                  </div>
                  <br />
                `:html``}


                ${this.selectedPersonStdInfo ? html`
                  <div class="boxer">
                    <div class="box-row"><!--Headings-->
                      <div class="box"><h6>Student Information for IAM ${this.informationHeaderID}</h6></div>
                      <div class="box hide"></div>
                    </div>
                    Student Status: <span style="color:green;">ACTIVE</span>
                    ${this.selectedPersonStdInfo.map(std =>html`
                          <div class="box-row"><div class="box"><strong>College</strong></div><div class="box">${std.collegeName ? html`${std.collegeName}`: html`<p>Not Listed</p>`}</div></div>
                          <div class="box-row"><div class="box"><strong>Class</strong></div><div class="box">${std.className ? html`${std.className}`: html`<p>Not Listed</p>`}</div></div>
                          <div class="box-row"><div class="box"><strong>Level</strong></div><div class="box">${std.levelName ? html`${std.levelName}`: html`<p>Not Listed</p>`}</div></div>
                          <div class="box-row"><div class="box"><strong>Major</strong></div><div class="box">${std.classdesc ? html`${std.classdesc}`: html`<p>Not Listed</p>`}</div></div>
                          <div class="box-row"><div class="box"><strong>Start Date</strong></div><div class="box">${std.createDate ? html`${dtUtls.fmtDatetime(std.createDate, true, true)}`: html`<p>Not Listed</p>`}</div></div>
                          <div class="box-row"><div class="box"><strong>Modify Date</strong></div><div class="box">${std.modifyDate ? html`${dtUtls.fmtDatetime(std.modifyDate, true, true)}`: html`<p>Not Listed</p>`}</div></div>
                    `)}
                  </div>
                  <br />
                `:html`Student Status: <span style="color:red;">INACTIVE</span>`}
              </div>
            `:html`<h4>There is no information on this individual in the IAM Database.</h4>`}
          </div>
        </div>
      </ucdlib-pages>

  </div>
</div>




<ucdlib-iam-modal id='alma-modal' dismiss-text='Close' content-title='Alma Record'>
  ${this.alma ? html`<pre style='font-size:15px;margin:0;'>${JSON.stringify(this.alma.payload, null, "  ")}</pre>` : html``}
</ucdlib-iam-modal>
`;}


/**
 * @description Renders form for querying by kerberos id
 * @returns {TemplateResult}
 */
export function renderUserIdForm(){
  const view = this.searchParamsByKey.userId;
  return html`
    <div id=${view.attribute}>
      <div class="field-container">
        <label ?hidden=${!this.hideNav} for=${'inp-'+ view.attribute}>${view.label}</label>
        <div class='text-input-container'>
          <input
            @input=${(e) => this.userId = e.target.value}
            .value=${this.userId}
            id=${'inp-'+ view.attribute}
            type="text"
            placeholder="Enter a UC Davis computing account...">
        </div>

      </div>
    </div>
  `;
}

/**
 * @description Renders form for querying by email
 * @returns {TemplateResult}
 */
 export function renderEmailForm(){
  const view = this.searchParamsByKey.email;
  return html`
    <div id=${view.attribute}>
      <div class="field-container">
        <label ?hidden=${!this.hideNav} for=${'inp-'+ view.attribute}>${view.label}</label>
        <div class='text-input-container'>
          <input
            @input=${(e) => this.email = e.target.value}
            .value=${this.email}
            id=${'inp-'+ view.attribute}
            type="email"
            placeholder="Enter an email address">
        </div>
      </div>
    </div>
  `;
}

/**
 * @description Renders form for querying by employee id
 * @returns {TemplateResult}
 */
export function renderEmployeeIdForm(){
  const view = this.searchParamsByKey.employeeId;
  return html`
    <div id=${view.attribute}>
      <div class="field-container">
        <label ?hidden=${!this.hideNav} for=${'inp-'+ view.attribute}>${view.label}</label>
        <div class='text-input-container'>
          <input
            @input=${(e) => this.employeeId = e.target.value}
            id=${'inp-'+ view.attribute}
            .value=${this.employeeId}
            type="number"
            pattern="[0-9]*"
            placeholder="Enter a UC Path ID number...">
        </div>
      </div>
    </div>
  `;
}

/**
 * @description Renders form for querying by student id
 * @returns {TemplateResult}
 */
export function renderStudentIdForm(){
  const view = this.searchParamsByKey.studentId;
  return html`
    <div id=${view.attribute}>
      <div class="field-container">
        <label ?hidden=${!this.hideNav} for=${'inp-'+ view.attribute}>${view.label}</label>
        <div class='text-input-container'>
          <input
            @input=${(e) => this.studentId = e.target.value}
            .value=${this.studentId}
            id=${'inp-'+ view.attribute}
            type="number"
            pattern="[0-9]*"
            placeholder="Enter a student ID number...">
        </div>
      </div>
    </div>
  `;
}

/**
 * @description Renders form for querying by name
 * @returns {TemplateResult}
 */
export function renderNameForm(){
  const view = this.searchParamsByKey.name;
  return html`
    <div id=${view.attribute}>
      <div class="field-container">
        <label for='inp-first-name'>First Name</label>
        <div class='text-input-container'>
          <input
            @input=${e => this.firstName = e.target.value}
            .value=${this.firstName}
            id='inp-first-name'
            type="text"
            placeholder="Enter a first name">
        </div>
      </div>
      <div class="field-container">
        <label for='inp-middle-name'>Middle Name</label>
        <div class='text-input-container'>
          <input
            @input=${e => this.middleName = e.target.value}
            .value=${this.middleName}
            id='inp-middle-name'
            type="text"
            placeholder="Enter a middle name">
        </div>
      </div>
      <div class="field-container">
        <label for='inp-last-name'>Last Name</label>
        <div class='text-input-container'>
          <input
            @input=${e => this.lastName = e.target.value}
            .value=${this.lastName}
            id='inp-last-name'
            type="text"
            placeholder="Enter a last name">
        </div>
      </div>
      <div class="checkbox">
        <input
          @input=${() => this.isDName = !this.isDName}
          id="inp-isDName"
          type="checkbox"
          .checked=${this.isDName}>
        <label for="inp-isDName">Query Online Directory</label>
      </div>
    </div>
  `;
}
