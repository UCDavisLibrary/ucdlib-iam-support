import { html } from 'lit';
import dtUtils from '#lib/utils/dtUtils.js';

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
        <rosetta-person-search
          @rosetta-person-selected=${e => this._onEmployeeSelect(e.detail.person)}
          class='u-space-px--medium u-space-py--medium u-align--auto border border--gold'
        ></rosetta-person-search>
      </div>

      <div id="information">
        <div ?hidden=${!this.selectedPersonProfile} class="field-container">
          ${this.selectedPersonProfile ? html`
            <div class="box-row"><div class="box"><h6>General Information for IAM ${this.informationHeaderID}</h6></div>
            <div class="box hide"></div></div>

            ${(this.firstName && this.middleName && this.lastName) 
              ? html`<div class="box-row"><div class="box"><strong>Name</strong></div><div class="box">${this.firstName} ${this.middleName} ${this.lastName}</div></div>`
              : html`<div class="box-row"><div class="box"><strong>Name</strong></div><div class="box">${this.selectedPersonProfile.displayname}</div></div>`
            }
            ${this.studentId ? html`<div class="box-row"><div class="box"><strong>Student ID</strong></div><div class="box">${this.studentId}</div></div>`:html``}
            ${this.employeeId ? html`<div class="box-row"><div class="box"><strong>Employee ID</strong></div><div class="box">${this.employeeId}</div></div>`:html``}
            ${this.userId ? html`<div class="box-row"><div class="box"><strong>Kerberos ID</strong></div><div class="box">${this.userId}</div></div>`:html``}
            ${this.email ? html`<div class="box-row"><div class="box"><strong>Email</strong></div><div class="box">${this.email}</div></div>`:html``}
            ${this.ldap?.ucdpersonaffiliation ? html`
              <div class="box-row">
                <div class="box"><strong>UCD Affiliation</strong></div><div class="box">${this.ldap.ucdpersonaffiliation}</div>
              </div>`: html``
            }             
            ${this.ldap?.ucdpersonsponsorexpirationdate && !Array.isArray(this.ldap?.ucdpersonsponsorexpirationdate) 
              ? html`<div class="box-row">
                      <div class="box"><strong>Sponsor Expiration Date</strong></div><div class="box">${dtUtils.formatLDAPDate(this.ldap.ucdpersonsponsorexpirationdate)}</div>
                    </div>`: 
                html``
            }
            ${this.alma 
              ? html`<div class="box-row"><div class="box"><strong>Alma</strong></div><div class="box"><a class='pointer icon icon--circle-arrow-right' @click=${this.openAlmaInfoModal}>Alma Record: <strong>${this.alma.id}</strong></a></div></div>`
              : html``
            }
            <div class="box-row"><div class="box"><strong>Created Date</strong></div><div class="box">${this.selectedPersonProfile?.create_date ? html`${dtUtils.fmtDatetime(this.selectedPersonProfile.create_date, true, true)}`: html`<p>Not Listed</p>`}</div></div> 
            <div class="box-row"><div class="box"><strong>Modified Date</strong></div><div class="box">${this.selectedPersonProfile?.modified_date ? html`${dtUtils.fmtDatetime(this.selectedPersonProfile.modified_date, true, true)}`: html`<p>Not Listed</p>`}</div></div>
            <br />

            <div class="boxer">
              <div class="box-row"><!--Headings-->
                <div class="box">
                  <h6>Department Information for IAM ${this.informationHeaderID}</h6>
                  <strong>Employee Status:</strong> ${this.selectedPersonDepInfo ? html`<span style="color:green;">ACTIVE</span>` : html`<span style="color:red;">INACTIVE</span>`}
                </div>
                <div class="box hide">
              </div>
            </div>
              
            ${this.selectedPersonDepInfo && this.selectedPersonDepInfo.map(dep =>html`
              <div class="box-row"><div class="box"><strong>Title</strong></div><div class="box">${dep.job_type_description ? html`${dep.job_type_description} (${dep.job_type_id})`: html`<p>Not Listed</p>`}</div></div>
              <div class="box-row"><div class="box"><strong>Position Type</strong></div><div class="box">${dep.employee_classification_description ? html`${dep.employee_classification_description} (${dep.employee_classification})`: html`<p>Not Listed</p>`}</div></div>
              <div class="box-row"><div class="box"><strong>Department</strong></div><div class="box">${dep.department_title ? html`${dep.department_title} (${dep.department_id})`: html`<p>Not Listed</p>`}</div></div>
              <div class="box-row"><div class="box"><strong>Start Date</strong></div><div class="box">${dep.start_date ? html`${dtUtils.fmtDatetime(dep.start_date, true, true)}`: html`<p>Not Listed</p>`}</div></div>
              <div class="box-row"><div class="box"><strong>End Date</strong></div><div class="box">${dep.termination_date ? html`${dtUtils.fmtDatetime(dep.termination_date, true, true)}`: html`<p>Indefinite</p>`}</div></div>
              <div class="box-row"><div class="box"><strong>Business Unit</strong></div><div class="box">${dep.business_unit_title ? html`${dep.business_unit_title} (${dep.business_unit_id})`: html`<p>Not Listed</p>`}</div></div> 
              <div class="box-row"><div class="box"><strong>Organization</strong></div><div class="box">${dep.organization_title ? html`${dep.organization_title} (${dep.organization_id})`: html`<p>Not Listed</p>`}</div></div>
              <div class="box-row"><div class="box"><strong>Division</strong></div><div class="box">${dep.division_title ? html`${dep.division_title} (${dep.division_id})`: html`<p>Not Listed</p>`}</div></div>
              <div class="box-row"><div class="box"><strong>Subdivision</strong></div><div class="box">${dep.subdivision_title ? html`${dep.subdivision_title} (${dep.subdivision_id})`: html`<p>Not Listed</p>`}</div></div>
              <div class="box-row"><div class="box"></div></div>
            `)}
            </div>
            <br />
            <br />

            <div class="boxer">
              <div class="box-row"><!--Headings-->
                <div class="box">
                  <h6>Student Information for IAM ${this.informationHeaderID}</h6>
                  <strong>Student Status:</strong> ${this.selectedPersonStdInfo ? html`<span style="color:green;">ACTIVE</span>` : html`<span style="color:red;">INACTIVE</span>`}
                </div>
                <div class="box hide">
              </div>
            </div>
            ${this.selectedPersonStdInfo && this.selectedPersonStdInfo.map(std =>html`
              <div class="box-row"><div class="box"><strong>College</strong></div><div class="box">${std.college_title ? html`${std.college_title} (${std.college_code})`: html`<p>Not Listed</p>`}</div></div>
              <div class="box-row"><div class="box"><strong>Class</strong></div><div class="box">${std.class_level ? html`${std.class_level}`: html`<p>Not Listed</p>`}</div></div> 
              <div class="box-row"><div class="box"><strong>Level</strong></div><div class="box">${std.academic_level ? html`${std.academic_level}`: html`<p>Not Listed</p>`}</div></div>
              <div class="box-row"><div class="box"><strong>Major</strong></div><div class="box">${std.major_title ? html`${std.major_title} (${std.major_code})`: html`<p>Not Listed</p>`}</div></div>
              <div class="box-row"><div class="box"></div></div>
            `)}
            </div>
            <br />
            <br />

            <div ?hidden=${!this.selectedPersonProfile?.affiliation} class="boxer">
              <div class="box-row"><div class="box"><h6>Affiliation for IAM ${this.informationHeaderID}</h6></div><div class="box hide"></div></div>
              <div class="box-row">
                <div class="box"><strong>Is Student</strong></div>
                <div class="box">
                  ${this.selectedPersonProfile?.affiliation?.student === 'Y' 
                    ? html`<p style="text-align:center;color:green;">&#x2713;</p>`
                    :html`<p style="text-align:center;color:red;">&#x2715;</p>`}
                </div>
              </div>
              <div class="box-row">
                <div class="box"><strong>Is Employee</strong></div>
                <div class="box">
                  ${this.selectedPersonProfile?.affiliation?.employee === 'Y' 
                    ? html`<p style="text-align:center;color:green;">&#x2713;</p>`
                    :html`<p style="text-align:center;color:red;">&#x2715;</p>`} 
                </div>
              </div>
              <div class="box-row">
                <div class="box"><strong>Is Student Applicant</strong></div>
                <div class="box">
                  ${this.selectedPersonProfile?.affiliation?.student_applicant === 'Y' ? 
                    html`<p style="text-align:center;color:green;">&#x2713;</p>`
                    :html`<p style="text-align:center;color:red;">&#x2715;</p>`}
                </div>
              </div>
              <div class="box-row">
                <div class="box"><strong>Is Faculty</strong></div>
                <div class="box">
                  ${this.selectedPersonProfile?.affiliation?.faculty === 'Y' 
                    ? html`<p style="text-align:center;color:green;">&#x2713;</p>`
                    :html`<p style="text-align:center;color:red;">&#x2715;</p>`}
                </div>
              </div>
              <div class="box-row">
                <div class="box"><strong>Is Temporary Affiliate</strong></div>
                <div class="box">
                  ${this.selectedPersonProfile?.affiliation?.temporary_affiliate === 'Y' 
                    ? html`<p style="text-align:center;color:green;">&#x2713;</p>`
                    :html`<p style="text-align:center;color:red;">&#x2715;</p>`}
                </div>
              </div>
              <div class="box-row">
                <div class="box"><strong>Is UCANR Affiliate</strong></div>
                <div class="box">
                  ${this.selectedPersonProfile?.affiliation?.ucanr_affiliate === 'Y' 
                    ? html`<p style="text-align:center;color:green;">&#x2713;</p>`
                    :html`<p style="text-align:center;color:red;">&#x2715;</p>`}
                </div>
              </div>
              <div class="box-row">
                <div class="box"><strong>Is USDA WHNRC Affiliate</strong></div>
                <div class="box">
                  ${this.selectedPersonProfile?.affiliation?.usda_whnrc_affiliate === 'Y' 
                    ? html`<p style="text-align:center;color:green;">&#x2713;</p>`
                    :html`<p style="text-align:center;color:red;">&#x2715;</p>`}
                </div>
              </div>
              <div class="box-row">
                <div class="box"><strong>Is HS Employee</strong></div>
                <div class="box">
                  ${this.selectedPersonProfile?.affiliation?.health_affiliate === 'Y' 
                    ? html`<p style="text-align:center;color:green;">&#x2713;</p>`
                    :html`<p style="text-align:center;color:red;">&#x2715;</p>`}
                </div>
              </div>
              <div ?hidden=${!this.selectedPersonProfile?.affiliation?.cosmos_affiliate} class="box-row">                <div class="box"><strong>Is Cosmos Affiliate</strong></div>
                <div class="box">
                  ${this.selectedPersonProfile?.affiliation?.cosmos_affiliate === 'Y' 
                    ? html`<p style="text-align:center;color:green;">&#x2713;</p>`
                    :html`<p style="text-align:center;color:red;">&#x2715;</p>`}
                </div>
              </div>
              <div ?hidden=${!this.selectedPersonProfile?.affiliation?.cpe_affiliate} class="box-row">
                <div class="box"><strong>Is CPE Affiliate</strong></div>
                <div class="box">
                  ${this.selectedPersonProfile?.affiliation?.cpe_affiliate === 'Y' 
                    ? html`<p style="text-align:center;color:green;">&#x2713;</p>`
                    :html`<p style="text-align:center;color:red;">&#x2715;</p>`}
                </div>
              </div> 
              <br />    
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