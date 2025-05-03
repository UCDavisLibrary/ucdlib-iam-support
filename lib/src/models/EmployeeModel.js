import {BaseModel} from '@ucd-lib/cork-app-utils';
import EmployeeService from '../services/EmployeeService.js';
import EmployeeStore from '../stores/EmployeeStore.js';

/**
 * @class EmployeeModel
 * @description Centralized state management for library employee data retrieved from local db via api.
 */
class EmployeeModel extends BaseModel {

  constructor() {
    super();

    this.store = EmployeeStore;
    this.service = EmployeeService;

    this.register('EmployeeModel');
  }

  /**
   * @description Returns all direct reports for the current user
   * @returns {Array}
   */
  async getDirectReports(){
    let state = this.store.data.directReports;
    try {
      if ( state && state.state === 'loading' ){
        await state.request
      } else {
        await this.service.getDirectReports();
      }
    } catch(e) {}
    return this.store.data.directReports;
  }

  /**
   * @description Search for employees by first or last name
   * @param {String} name
   * @returns {Object} {total, results}
   */
  async searchByName(name){
    let state = this.store.data.byName[name];
    try {
      if ( state && state.state === 'loading' ){
        await state.request
      } else {
        await this.service.searchByName(name);
      }
    } catch(e) {}
    return this.store.data.byName[name];
  }

    /**
   * @description Get the metadata for employees by employee id
   * @param {String} id
   * @returns {Object} {total, results}
   */
    async getMetadata(id, idType){
      let state = this.store.data.byMetadata[id];
      try {
        if ( state && state.state === 'loading' ){
          await state.request
        } else {
          await this.service.getMetadata(id, idType);
        }
      } catch(e) {}
      return this.store.data.byMetadata[id];
    }

  /**
   * @description Update the metadata for employees by employee id
   * @param {Object} data
   * @param {String} id
   * @returns {Object} {total, results}
   */
  async updateMetadata(data, id) {
    let state = this.store.data.updateMetadata[id];
    try {
      if ( state && state.state === 'loading' ){
        await state.request
      } else {
        await this.service.updateMetadata(data, id) ;
      }
    } catch(e) {}
    return this.store.data.updateMetadata[id];
  }

}

const model = new EmployeeModel();
export default model;
