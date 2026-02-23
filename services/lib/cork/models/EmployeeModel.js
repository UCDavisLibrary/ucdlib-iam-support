import {BaseModel} from '@ucd-lib/cork-app-utils';
import EmployeeService from '../services/EmployeeService.js';
import EmployeeStore from '../stores/EmployeeStore.js';

import clearCache from '../utils/clearCache.js';

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
   */
  getDirectReports(){
    return this.service.getDirectReports();
  }

  /**
   * @description Search for employees by first or last name
   * @param {String} name
   * @returns {Object} {total, results}
   */
  searchByName(name){
    return this.service.searchByName(name);
  }

  /**
   * @description Get employee by an id
   * @param {Number} id
   * @returns {Object} {total, results}
   */
  get(id, idType='id'){
    return this.service.get(id, idType);
  }

  /**
   * @description updates employee infomation
   */
  async update(id, payload){
    const res = await this.service.update(id, payload);
    if ( res.state === 'loaded' ) {
      clearCache();
    }
    return res;
  }

  /**
   * @description add employee to group
   */
  
  async addToGroup(id, payload){
    const res = await this.service.addToGroup(id, payload);
    if ( res.state === 'loaded' ) {
      clearCache();
    }
    return res;
  }

  /**
   * @description remove employee from group
   */
  async removeFromGroup(id, payload){
    const res = await this.service.removeFromGroup(id, payload);
    if ( res.state === 'loaded' ) {
      clearCache();
    }
    return res;
  }

  /**
   * @description List the employee's active record discrepancy notifications
   * @returns {Array}
   */
  getActiveDiscrepancy(id){
    return this.service.getActiveDiscrepancy(id);
  }

  async dismissDiscrepancies(id, discrepanciesList){
    const res = await this.service.dismissDiscrepancies(id, discrepanciesList);
    if ( res.state === 'loaded' ) {
      clearCache();
    }
    return res;
  }

}

const model = new EmployeeModel();
export default model;
