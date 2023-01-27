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

  /**
   * @description Searches for a person by IAM ID
   * @param {Number} id - ID Number
   * @param {Boolean} getPayload - Return just the API payload 
   * @param {Boolean} getSingle - Returns just the person record, a 404 error will be returned if doesnt exist
   * @returns {Object}
   */
  async getPersonByIamId(id, getPayload=true, getSingle=true){
    return await this._getPersonById(id, 'iamId', getPayload, getSingle);
  }

  /**
   * @description Searches for a person by Employee ID
   * @param {Number} id - ID Number
   * @param {Boolean} getPayload - Return just the API payload 
   * @param {Boolean} getSingle - Returns just the person record, a 404 error will be returned if doesnt exist
   * @returns {Object}
   */
  async getPersonByEmployeeId(id, getPayload=true, getSingle=true){
    return await this._getPersonById(id, 'employeeId', getPayload, getSingle);
  }

  /**
   * @description Searches for a person by User ID (kerberos)
   * @param {Number} id - ID Number
   * @param {Boolean} getPayload - Return just the API payload 
   * @param {Boolean} getSingle - Returns just the person record, a 404 error will be returned if doesnt exist
   * @returns {Object}
   */
  async getPersonByUserId(id, getPayload=true, getSingle=true){
    return await this._getPersonById(id, 'userId', getPayload, getSingle);
  }

  /**
   * @description Searches for a person by Student ID
   * @param {Number} id - ID Number
   * @param {Boolean} getPayload - Return just the API payload 
   * @param {Boolean} getSingle - Returns just the person record, a 404 error will be returned if doesnt exist
   * @returns {Object}
   */
  async getPersonByStudentId(id, getPayload=true, getSingle=true){
    return await this._getPersonById(id, 'studentId', getPayload, getSingle);
  }

  /**
   * @description Searches for a person by email
   * @param {String} email - Full email address
   * @param {Boolean} getPayload - Return just the API payload 
   * @param {Boolean} getSingle - Returns just the person record, a 404 error will be returned if doesnt exist
   * @returns {Object}
   */
  async getPersonByEmail(email, getPayload=true, getSingle=true){
    return await this._getPersonById(email, 'email', getPayload, getSingle);
  }

  /**
   * @description Gets the search endpoint enabled for the specified url query parameter
   * @param {String} parameter - a url query parameter key ie 'studentId'
   * @returns {Object}
   */
  getPersonSearchEndpoint(parameter){
    return this.service.searchParamToEndpoint[parameter];
  }

  async _getPersonById(id, idType, getPayload=true, getSingle=true){
    try {
      await this.service.getPersonById(id, idType);
    } catch(e) {}
    const response = this.store.data[idType][id];
    if ( !getPayload ) return response;
    const payload = this._getPayload(response);
    if ( !getSingle) return payload;
    return this._getSingle(payload);
  }

  /**
   * @description extracts payload from response
   * Standardizes error response from IAM API
   * @param searchResults - A stored people search object
   */
  _getPayload(searchResults){
    let output;
    if ( searchResults.state === 'loaded' && searchResults.payload.responseStatus != 0 ){
      output = {
        error: true,
        details: {
          name: 'APIError',
          code: searchResults.payload.responseStatus
        },
        message: searchResults.payload.responseDetails,
        response: {
          status: 502
        }
      };
    } else if ( searchResults.state === 'loaded' ) {
      output = searchResults.payload;
    } else {
      output = searchResults.error
    }
    return output;
  }

  /**
   * @description Extracts first result from a query response
   * If no result, returns an error object
   * @param {*} payload 
   */
  _getSingle(payload){
    if (payload.error) return payload;
    let out;
    if ( payload.responseData.results.length ) {
      out = payload.responseData.results[0];
    } else {
      out = {
        error: true,
        response: {
          status: 404
        },
        message: "Record not found."
      }
    }
    return out;
  }

}

const model = new UcdIamModel();
export default model;