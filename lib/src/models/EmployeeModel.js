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
   * @description updates employee infomation
   * @returns {Array}
   */
    async update(id, payload){
      let state = this.store.data.update;
      try {
        if ( state.state === 'loading' ){
          await state.request
        } else {
          await this.service.update(id, payload);
        }
      } catch(e) {}
      return this.store.data.update;
    }

  /**
   * @description add employee from group
   * @returns {Array}
   */
      async addToGroup(id, payload){
        let state = this.store.data.addEmployeeToGroup;
        try {
          if ( state.state === 'loading' ){
            await state.request
          } else {
            await this.service.addToGroup(id, payload);
          }
        } catch(e) {}
        return this.store.data.addEmployeeToGroup;
      }

  /**
   * @description remove employee from group
   * @returns {Array}
   */
     async removeFromGroup(id, payload){
      let state = this.store.data.removeEmployeeFromGroup;
      try {
        if ( state.state === 'loading' ){
          await state.request
        } else {
          await this.service.removeFromGroup(id, payload);
        }
      } catch(e) {}
      return this.store.data.removeEmployeeFromGroup;
    }
}

const model = new EmployeeModel();
export default model;
