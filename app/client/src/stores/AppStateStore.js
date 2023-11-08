import { AppStateStore } from "@ucd-lib/cork-app-state";

/**
 * @description Implementation of AppStateStore
 */
class AppStateStoreImpl extends AppStateStore {
  constructor() {
    super();
    this.lastPage = 'home';

    // static breadcrumb values
    this.breadcrumbs = {
      home: {text: 'Home', link: '/'},
      onboarding: {text: 'Onboarding', link: `/onboarding`},
      onboardingNew: {text: 'New Request', link: `/onboarding/new`},
      onboardingNewLookup: {text: 'Lookup Employee', link: `/onboarding/new#lookup`},
      onboardingNewManual: {text: 'Manual Entry', link: `/onboarding/new#manual`},
      onboardingNewSubmission: {text: 'Submission', link: `/onboarding/new#submission`},
      onboardingTransfer: {text: 'Transfer', link: `/onboarding/new#transfer`},
      usersSearch: {text: 'New Request', link: `/users/search`},
      separation: {text: 'Separation', link: '/separation'},
      separationNew: {text: 'New Request', link: '/separation/new'},
      separationNewLookup: {text: 'Lookup Employee', link: '/separation/new#lookup'},
      separationNewSubmission: {text: 'Submission', link: '/separation/new#submission'},
      permissions: {text: 'Permissions', link: '/permissions'},
      permissionsReport: {text: 'Select a Direct Report', link: '/permissions#report'},
      permissionsApplications: {text: 'Select Applications', link: '/permissions#applications'},
      permissionsEmployee: {text: 'Select a UC Davis Employee', link: '/permissions#employee'},
      orgChart: {text: 'Create Organizational Chart Tool', link: '/orgChart'}
    };

    // static page title values
    this.pageTitles = {
      onboarding: 'Onboarding',
      separation: 'Separation',
      onboardingNew: 'New Onboarding Request',
      separationNew: 'New Separation Request',
      usersSearch: 'Alma Users Search',
      permissions: 'Employee Permissions',
      orgChart: 'Organization Chart Tool'
    };

    this.userProfile = {};

    this.events.APP_STATUS_CHANGE = 'app-status-change';
    this.events.APP_HEADER_UPDATE = 'app-header-update';
    this.events.ALERT_BANNER_UPDATE = 'alert-banner-update';
  }
}

const store = new AppStateStoreImpl();
export default store;
