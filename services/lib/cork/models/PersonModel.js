import {BaseModel} from '@ucd-lib/cork-app-utils';
import PersonService from '../services/PersonService.js';
import PersonStore from '../stores/PersonStore.js';

/**
 * @class PersonModel
 * @description Centralized state management for UC Davis person data retrieved from UCD IAM API via local api
 * Should be used for browser requests.
 */
class PersonModel extends BaseModel {

  constructor() {
    super();

    this.store = PersonStore;
    this.service = PersonService;

    this.register('PersonModel');
  }

  /**
   * @description Get a person by an identifier
   * @param {String} id - The identifier to search for
   * @param {String} idType - See UcdIamModel for valid identifiers
   * @returns
   */
  async getPersonById(id, idType='iamId'){
    return this.service.getPersonById(id, idType);
  }

  /**
   * @description Searches for a person by name
   * @param {String} last - Last Name
   * @param {String} first - First Name
   * @param {String} middle - Middle Name
   * @param {Boolean} useDirectory - Whether to query name in online directory instead of official name
   * @returns Array of people or error object
   */
   async getPersonByName(last, first, middle, useDirectory){
    return this.service.getPersonByName(last, first, middle, useDirectory);
  }

}

const model = new PersonModel();
export default model;
