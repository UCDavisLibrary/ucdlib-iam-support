import util from 'util';
import { printTable } from 'console-table-printer';

import models from '#models';
import config from "#lib/utils/config.js";
import pg from '#lib/utils/pg.js';
import {UcdIamModel} from '#lib/cork/models/UcdIamModel.js';
import IamPersonTransform from '#lib/utils/IamPersonTransform.js';

UcdIamModel.init(config.ucdIamApi);

class UtilsCli{

  constructor(){
    this.employeeIds = ['iamId', 'employeeId', 'userId', 'email', 'id'];
  }

  logObject(data){
    console.log(util.inspect(data, { showHidden: false, depth: null, colors: true }));
  }

  printTable(data, columns) {
    if ( columns ){
      printTable(data.map(r => {return columns.reduce((acc, col) => {acc[col] = r[col]; return acc;}, {})}));
    } else {
      printTable(data);
    }

  }

  /**
   * @description Validate employee exists
   * @param {String} employee_id - Employee unique identifier
   * @param {String} idType - Type of employee_id
   * @param {Object} args - Additional arguments to pass to getById method of employees model
   * @returns
   */
  async validateEmployee(employee_id, idType, args){
    let employee = await models.employees.getById(employee_id.trim(), idType, args);
    if ( employee.err ) {
      console.log(employee.err);
      await pg.pool.end();
      return;
    }
    if ( !employee.res.rowCount ) {
      console.log('No employee found');
      await pg.pool.end();
      return;
    }
    return employee.res.rows[0];
  }

  async validateIamRecord(iamId){
    const iamRecord = await UcdIamModel.getPersonByIamId(iamId);
    if ( iamRecord.error ) {
      if ( !UcdIamModel.noEmployeeFound(iamRecord) ) {
        console.log(`Error interacting with IAM API: ${iamRecord.message}`);
        return
      } else {
        console.log(`No record found in UCD IAM for iam id '${iamId}'`);
        return
      }
    }
    return new IamPersonTransform(iamRecord);
  }
}

export default new UtilsCli();
