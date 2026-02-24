import {BaseService} from '@ucd-lib/cork-app-utils';
import AuthStore from '../stores/AuthStore.js';

class AuthService extends BaseService {

  constructor() {
    super();
    this.store = AuthStore;
  }

}

const service = new AuthService();
export default service;