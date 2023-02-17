const {AppStateStore} = require('@ucd-lib/cork-app-state');

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
      separation: {text: 'Separation', link: 'separation'}
    };

    // static page title values
    this.pageTitles = {
      onboarding: 'Onboarding',
      separation: 'Separation',
      onboardingNew: 'New Onboarding Request'
    };

    this.events.APP_STATUS_CHANGE = 'app-status-change';
    this.events.APP_HEADER_UPDATE = 'app-header-update';
  }
}

module.exports = new AppStateStoreImpl();