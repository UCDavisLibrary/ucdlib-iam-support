import {BaseService} from '@ucd-lib/cork-app-utils';
import UcdIamStore from '../stores/UcdIamStore.js';

class UcdIamService extends BaseService {

  constructor() {
    super();
    this.store = UcdIamStore;
  }

}

const service = new UcdIamService();
export default service;