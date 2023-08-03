import util from 'util';
import config from './cli-config.js';
import { printTable } from 'console-table-printer';
import UcdlibEmployees from '@ucd-lib/iam-support-lib/src/utils/employees.js';
import pg from '@ucd-lib/iam-support-lib/src/utils/pg.js';
import {UcdIamModel} from '@ucd-lib/iam-support-lib/index.js';
import IamPersonTransform from '@ucd-lib/iam-support-lib/src/utils/IamPersonTransform.js';

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
   * @param {Object} args - Additional arguments to pass to UcdlibEmployees.getById
   * @returns
   */
  async validateEmployee(employee_id, idType, args){
    let employee = await UcdlibEmployees.getById(employee_id.trim(), idType, args);
    if ( employee.err ) {
      console.log(employee.err);
      await pg.client.end();
      return;
    }
    if ( !employee.res.rowCount ) {
      console.log('No employee found');
      await pg.client.end();
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
