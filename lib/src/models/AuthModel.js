import {BaseModel} from '@ucd-lib/cork-app-utils';
import AuthService from '../services/AuthService.js';
import AuthStore from '../stores/AuthStore.js';
import AppConfig from "../config.js";

class AuthModel extends BaseModel {

  constructor() {
    super();

    this.store = AuthStore;
    this.service = AuthService;

    // Lifespan of client access token entered in keycloak
    this.tokenRefreshRate = 300;

    // Interval for checking if user still has an active session
    this.loginCheckRefreshRate = 10 * 60 * 1000;

    this.register('AuthModel');
  }

  /**
   * @description Initializes model. Starts interval for checking session status
   * @returns
   */
  init(){
    if ( this._init ) return;
    this._init = true;
    this.kc = AppConfig.keycloakClient;

    setInterval(async () => {
      this.kc.updateToken(this.tokenRefreshRate);
    }, this.loginCheckRefreshRate );

  }

  /**
   * @description Logs user out of application
   */
   logout(redirectOnly){
    const redirectUri = window.location.origin + '/logged-out.html';
    if ( redirectOnly ){
      window.location = redirectUri;
      return;
    }
    try {
      this.kc.logout({redirectUri});
    } catch (e) {
      window.location = redirectUri;
    }
  }

  /**
   * @description Send user to "unauthorized" page
   */
  redirectUnauthorized(){
    window.location = window.location.origin + '/unauthorized.html';
  }

  /**
   * @description Returns access token of logged in user
   * @returns {AccessToken}
   */
  getToken(){
    return this.store.token;
  }

  /**
   * @description Fires when a token has been successfully refreshed
   */
  _onAuthRefreshSuccess(){
    this.store.setToken(this.kc.tokenParsed);
    if ( !this.store.token.hasAccess ){
      this.redirectUnauthorized();
    }
  }

  /**
   * @description Logs user out if access token fails to refresh (their session expired)
   */
   _onAuthRefreshError(){
    this.logout();
  }

}

const model = new AuthModel();
export default model;
