import {BaseService} from '@ucd-lib/cork-app-utils';

export default class BaseServiceImp extends BaseService {
  constructor() {
    super();
  }

  async request(options){
    if( typeof window !== 'undefined' && window.keycloak ) { 
      const kc = window.keycloak;
      if( !options.fetchOptions ) options.fetchOptions = {};
      if( !options.fetchOptions.headers ) options.fetchOptions.headers = {};
      try {
        await kc.updateToken(10);
        options.fetchOptions.headers.Authorization = `Bearer ${kc.token}`
      } catch (error) {}
    } 
    return await super.request(options);
  }

  async _handleError(options, reject, error) {

    // check if we are:
    // a. not authorized to access a particular resource (throw error)
    // b. have been signed out (redirect to logged-out page)
    if( typeof window !== 'undefined' && window.keycloak ) { 
      if ( error.response && error.response.status === 403 ){
        window.keycloak.updateToken(600);
      }
    }
    super._handleError(options, reject, error);
  }
}