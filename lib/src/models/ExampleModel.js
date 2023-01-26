import {BaseModel} from '@ucd-lib/cork-app-utils';
import ExampleService from '../services/ExampleService.js';
import ExampleStore from '../stores/ExampleStore.js';

class ExampleModel extends BaseModel {

  constructor() {
    super();

    this.store = ExampleStore;
    this.service = ExampleService;
      
    this.register('ExampleModel');
  }

  test(){
    console.log('hello world!');
  }

}

const model = new ExampleModel();
export default model;