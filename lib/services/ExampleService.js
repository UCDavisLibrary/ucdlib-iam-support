import {BaseService} from '@ucd-lib/cork-app-utils';
import ExampleStore from '../stores/ExampleStore.js';

class ExampleService extends BaseService {

  constructor() {
    super();
    this.store = ExampleStore;
  }

}

const service = new ExampleService();
export default service;