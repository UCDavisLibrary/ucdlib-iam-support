import { html } from 'lit';

/**
 * @description Main render function
 * @returns {TemplateResult}
 */
export function render() {
  return html`
  <div class='l-container l-basic--flipped'>
    <div class="l-sidebar-second">
      <a href="/onboarding/new" class="focal-link category-brand--redbud u-space-mb">
        <div class="focal-link__figure focal-link__icon">
          <i class="fas fa-user-plus fa-2x"></i>
        </div>
        <div class="focal-link__body">
          <strong>Make a New Request</strong><br>(HR Only)
        </div>
      </a>
      <div ?hidden=${!this.canViewActiveList}>
        <a class="focal-link category-brand--putah-creek pointer" @click=${this.showSearchModal}>
          <div class="focal-link__figure focal-link__icon">
            <i class="fas fa-search fa-2x"></i>
          </div>
          <div class="focal-link__body">
            <strong>Search for Prior Records</strong>
          </div>
        </a>
      </div>
    </div>
    <div class="l-content">
      <ucdlib-iam-onboarding-list
        id=${this.activeId}
        panel-title='All Active Requests'
        panel-icon='fa-folder-open'
        brand-color='arboretum'
        open-status='open'
        no-results-message='There are no active onboarding requests at this time.'
        ?hidden=${!this.canViewActiveList}
      >
    </ucdlib-iam-onboarding-list>
    <ucdlib-iam-onboarding-list
        id=${this.supervisorId}
        panel-title='Your Employees'
        panel-icon='fa-network-wired'
        brand-color='poppy'
        supervisor-id=${this.userIamId}
        no-results-message="You don't have any employee onboarding requests"
      >
    </ucdlib-iam-onboarding-list>
    </div>
  </div>
  <ucdlib-iam-modal id='ob-search' dismiss-text='Close' content-title="Search For Prior Onboarding Records" auto-width>
    <ucdlib-iam-existing-search
      search-param='name'
      widget-title=''
      @onboarding-select=${this.hideSearchModal}
      class='u-space-px--medium u-space-py--medium u-align--auto border border--gold'
      onboarding>
    </ucdlib-iam-existing-search>
  </ucdlib-iam-modal>
`;}
