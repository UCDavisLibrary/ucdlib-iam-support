import {BaseModel} from '@ucd-lib/cork-app-utils';
import RosettaService from '../services/RosettaService.js';
import RosettaStore from '../stores/RosettaStore.js';

class RosettaModel extends BaseModel {

  constructor() {
    super();

    this.store = RosettaStore;
    this.service = RosettaService;
      
    this.register('RosettaModel');
  }

  /**
   * @description Get a Rosetta person record by a unique identifier
   * @param {String} id - The identifier value to search by
   * @param {String} [idType='iamId'] - Type of identifier being searched by (case-insensitive) -
   * one of iamId, email, loginId, employeeId, studentId
   * @returns {Promise<Object>} Cork response object {state, payload}
   */
  getPersonById(id, idType='iamId'){
    return this.service.getPersonById(id, idType);
  }

  /**
   * @description Search for Rosetta person records by name
   * @param {Object} [query] - Search query params. At least one of firstName/lastName is required.
   * @param {String} [query.firstName] - First name to search by
   * @param {String} [query.lastName] - Last name to search by
   * @param {Boolean} [query.partial] - If true, performs a partial (LIKE) match on the provided
   * name field(s) instead of an exact match
   * @returns {Promise<Object>} Cork response object {state, payload}
   */
  getPersonByName(query={}){
    return this.service.getPersonByName(query);
  }

}

const model = new RosettaModel();
export default model;