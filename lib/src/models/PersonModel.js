import {BaseModel} from '@ucd-lib/cork-app-utils';
import PersonService from '../services/PersonService.js';
import PersonStore from '../stores/PersonStore.js';

class PersonModel extends BaseModel {

  constructor() {
    super();

    this.store = PersonStore;
    this.service = PersonService;
      
    this.register('PersonModel');
  }

  async getPersonById(id, idType='iamId', event='search'){
    if ( !id ) {
      console.warn('id is a required argument');
    }
    try {
      await this.service.getPersonById(id, idType, event);
    } catch(e) {}
    return this.store.data[idType][id];

  }

  async getPeopleByIds(ids, event='search'){
    if ( !ids ) {
      console.warn('id is a required argument');
    }
    try {
      await this.service.getPeopleByIds(ids, event);
    } catch(e) {}
    return this.store.data.bulk[ids];

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
    try {
      await this.service.getPersonByName(last, first, middle, useDirectory);
    } catch(e) {}
    const key = this.service._makeNameQuery(last, first, middle, useDirectory).toString();
    const response = this.store.data.name[key];
    return response
  }

}

const model = new PersonModel();
export default model;