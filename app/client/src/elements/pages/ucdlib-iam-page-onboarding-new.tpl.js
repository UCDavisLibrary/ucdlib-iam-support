import { html } from 'lit';

/**
 * @description main render function
 * @returns {TemplateResult}
 */
export function render() { 
  return html`
  <div class='l-container u-space-pb'>
    <ucdlib-pages selected=${this.page}>
      <div id='home'>
        <div class="priority-links">
          <div class="priority-links__item">
            <a href="#lookup" class="vertical-link vertical-link--circle category-brand--tahoe">
              <div class="vertical-link__figure">
                <i class="vertical-link__image fas fa-search fa-3x"></i>
              </div>
              <div class="vertical-link__title">
                Search UC Davis Directory <br> (preferred)
              </div>
            </a>
          </div>
          <div class="priority-links__item">
            <a href="#manual" class="vertical-link vertical-link--circle category-brand--delta">
              <div class="vertical-link__figure">
                <i class="vertical-link__image fas fa-pen fa-3x"></i>
              </div>
              <div class="vertical-link__title">
                Manually Enter Employee
              </div>
            </a>
          </div>
        </div>
      </div>
      <div id='lookup'>
        <ucdlib-iam-search search-param='employee-id' class='u-space-px--medium u-space-py--medium u-align--auto border border--gold'></ucdlib-iam-search>
      </div>
      <div id='manual'>
        <p>form to enter employee info will go here</p>
      </div>
      <div id='submission'>
        <form class='form-single-col' @submit=${this._onSubmit}>
          <div ?hidden=${!this.hasMultipleAppointments}>
            <div class="panel panel--icon panel--icon-custom o-box panel--icon-double-decker">
              <h2 class="panel__title"><span class="panel__custom-icon fas fa-exclamation-circle"></span>Appointment</h2>
              <section>
                <p class='double-decker'>This employee has more than one appointment. Please select their primary appointment:</p>
                <div class="field-container">
                  <label for="appointments">Appointment</label>
                  <select id="appointments" required @input=${(e) => this._onAppointmentSelect(e.target.value)}>
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
                  <label for="start-date">Start Date <abbr title="Required">*</abbr></label>
                  <input id='start-date' type="date" required .value=${this.startDate} @input=${(e) => {this.startDate = e.target.value}}>
                </div>
              </section>
            </div>
          </div>
          <div>
            <div class="panel panel--icon panel--icon-custom o-box panel--icon-pinot">
              <h2 class="panel__title"><span class="panel__custom-icon fas fa-user-tie"></span>Employee</h2>
              <section>
                employee data
              </section>
            </div>
          </div>
          <button 
              type='submit' 
              class="btn btn--block btn--alt btn--search">Submit</button>
          </form>
        </form>
      </div>
    </ucdlib-pages>

  </div>

`;}