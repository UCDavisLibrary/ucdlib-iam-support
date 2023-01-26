import {BaseModel} from '@ucd-lib/cork-app-utils';
import UcdIamService from '../services/UcdIamService.js';
import UcdIamStore from '../stores/UcdIamStore.js';

class UcdIamModel extends BaseModel {

  constructor() {
    super();

    this.store = UcdIamStore;
    this.service = UcdIamService;
      
    this.register('UcdIamModel');
  }

  /**
   * @description Initialize the model by passing through an API key
   * @param {String|Object} config - Either API key or config object.
   */
  init(config={}){
    const defaultConfig = {
      url: 'https://iet-ws.ucdavis.edu/api/iam',
      version: '1.0',
      key: ''
    };
    if ( typeof config === 'string' ){
      config = {key: config};
    }
    this.service.config = {
      ...defaultConfig,
      ...config
    };
  }

  getPersonByIamId(id){
    this._getPersonById(id, 'iamId');
  }

  getPersonByEmployeeId(id){
    this._getPersonById(id, 'employeeId');
  }

  getPersonByUserId(id){
    this._getPersonById(id, 'userId');
  }

  getPersonByStudentId(id){
    this._getPersonById(id, 'studentId');
  }

  _getPersonById(id, idType){

  }

}

const model = new UcdIamModel();
export default model;