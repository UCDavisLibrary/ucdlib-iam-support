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
      usersSearch: {text: 'New Request', link: `/users/search`},
      // // usersSearchManual: {text: 'Manual Entry', link: `/users/search#manual`},
      // usersSearchAlma: {text: 'Alma Form', link: `/users/search#almaForm`},    
      separation: {text: 'Separation', link: 'separation'}
    };

    // static page title values
    this.pageTitles = {
      onboarding: 'Onboarding',
      separation: 'Separation',
      onboardingNew: 'New Onboarding Request',
      usersSearch: 'Alma Users Search'
    };

    this.userProfile = {};

    this.events.APP_STATUS_CHANGE = 'app-status-change';
    this.events.APP_HEADER_UPDATE = 'app-header-update';
    this.events.ALERT_BANNER_UPDATE = 'alert-banner-update';
  }
}

const store = new AppStateStoreImpl();
export default store;