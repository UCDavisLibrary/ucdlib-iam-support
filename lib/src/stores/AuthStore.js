import {BaseStore} from '@ucd-lib/cork-app-utils';
import AccessToken from '../utils/accessToken.js';

class AuthStore extends BaseStore {

  constructor() {
    super();

    this.token = new AccessToken({});
    this.events = {
      TOKEN_REFRESHED: 'token-refreshed',
    };
  }

  setToken(token={}){
    this.token = new AccessToken(token);
    this.emit(this.events.TOKEN_REFRESHED, this.token);
  }

}

const store = new AuthStore();
export default store;