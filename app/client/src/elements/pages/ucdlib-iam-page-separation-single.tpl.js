import { html } from 'lit';

/**
 * @description Main render function for this element
 * @returns {TemplateResult}
 */
export function render() {
  return html`
  <div class='l-container u-space-pb'>
    <div class='l-basic--flipped'>
      <div class="l-content">
        <div class="panel panel--icon panel--icon-custom o-box panel--icon-quad">
          <h2 class="panel__title"><span class="panel__custom-icon fas fa-briefcase"></span>Separation Details</h2>
            <div><label class='u-inline'>Employee ID:</label> ${this.employeeId}</div>
            <div><label class='u-inline'>Employee User ID:</label> ${this.employeeUserId}</div>
            <div><label class='u-inline'>Separation Date:</label> ${this.separationDate}</div>
        </div>
        <div class="panel panel--icon panel--icon-custom o-box panel--icon-delta">
          <h2 class="panel__title"><span class="panel__custom-icon fas fa-sitemap"></span>Supervisor</h2>
          <div><label class='u-inline'>Name:</label> ${this.supervisorName}</div>
          <div><label class='u-inline'>IAM ID:</label> ${this.supervisorId}</div>
        </div>
        <div class="panel panel--icon panel--icon-custom o-box panel--icon-poppy" ?hidden=${!this.notes}>
          <h2 class="panel__title"><span class="panel__custom-icon fas fa-sticky-note"></span>Additional Information</h2>
          <div>${this.notes}</div>
        </div>
      </div>
      <div class="l-sidebar-second">
        <!-- <div class='category-brand__background-light-gold o-box u-space-mb'>
          <div class="panel panel--icon panel--icon-custom panel--icon-delta o-box background-transparent">
            <h2 class="panel__title u-space-mb"><span class="panel__custom-icon fas fa-tasks></span><strong>Off-Boarding Checklist (TO-DO)</strong> </h2>
            <div class='primary'>Put todo list here</div>
          </div>
        </div> -->
        <div class='category-brand__background-light-gold o-box u-space-mb'>
          <div class="panel panel--icon panel--icon-custom ${this.isActiveStatus ? 'panel--icon-secondary' : 'panel--icon-quad'} o-box background-transparent">
            <h2 class="panel__title u-space-mb"><span class="panel__custom-icon fas ${this.isActiveStatus ? 'fa-check-circle' : 'fa-spinner'}"></span>Status</h2>
            <div class='primary fw-bold'>${this.status}</div>
            <div class='primary'>${this.statusDescription}</div>
          </div>
        </div>
        <ucdlib-rt-history .ticketId=${this.rtTicketId}></ucdlib-rt-history>
      </div>
    </div>
  </div>

`;}
