import {BaseService, getLogger} from '@ucd-lib/cork-app-utils';
import AppConfig from '../config.js';

export default class BaseServiceImp extends BaseService {
  constructor() {
    super();
  }

  _initLogger(name) {
    if( this._logger ) return;
    if( !name ) name = this.constructor.name.toLowerCase();
    this._logger = getLogger(name);
  }

  get logger() {
    if( !this._logger ) this._initLogger();
    return this._logger;
  }

  async request(options){
    if( AppConfig.keycloakClient ) {
      const kc = AppConfig.keycloakClient;
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
    if( AppConfig.keycloakClient ) {
      if ( error.response && error.response.status === 403 ){
        AppConfig.keycloakClient.updateToken(600);
      }
    }

    if (typeof window !== 'undefined' && error?.response?.status >= 500) {
      const e = JSON.parse(JSON.stringify(error));
      e.response = {
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        url: error?.response?.url
      };
      this.logger.error('Server error', e);
    }

    super._handleError(options, reject, error);
  }
}
