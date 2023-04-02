import UcdlibEmployees from "@ucd-lib/iam-support-lib/src/utils/employees.js";
import UcdlibCache from '@ucd-lib/iam-support-lib/src/utils/cache.js';
import { UcdIamModel } from "@ucd-lib/iam-support-lib/index.js";
import IamPersonTransform from "@ucd-lib/iam-support-lib/src/utils/IamPersonTransform.js";
import config from "./config.js";

export class IamEmployees {
  constructor(){
    this.iam = UcdIamModel;
    this.iam.init(config.ucdIamApi);

    this.employees = [];
    this.iamResponses = {byId: {}, byEmployeeId: {}};
    this.employeeIdToIamId = {};
    this.discrepancies = [];
    this.updates = [];
  }

  // get records from local employees table
  async getEmployees(){
    const employees = await UcdlibEmployees.getAll();
    if ( employees.err ){
      throw employees.err;
    }
    this.employees = employees.res.rows.slice(0, 10); // TODO remove slice
  }

  // get iam records for employees and supervisors in employees table
  async getIamRecords(){

    // get iam records for employees and supervisors
    for ( let employee of this.employees ){
      for ( let iamId of [employee.iam_id, employee.supervisor_id]){
        if ( !iamId ) continue;
        if ( this.iamResponses.byId[iamId] ) continue;
        const cache = await UcdlibCache.get('iamId', iamId, config.ucdIamApi.cacheExpiration);
        if ( cache.res && cache.res.rowCount ) {
          this.iamResponses.byId[iamId] = cache.res.rows[0].data;
          continue;
        }
        const response = await this.iam.getPersonByIamId(iamId);
        if ( response.error && !this.iam.noEmployeeFound(response) ){
          response.error.message = 'Unable to connect to the UCD IAM API';
          throw response.error;
        }
        if ( !response.error ) {
          await UcdlibCache.set('iamId', iamId, response);
        }
        this.iamResponses.byId[iamId] = response;
      }
    }
    
    // loop iam id responses and map to employee id
    for ( let iamId in this.iamResponses.byId ){
      const response = this.iamResponses.byId[iamId];
      if ( response.employeeId ) {
        this.employeeIdToIamId[response.employeeId] = iamId;
      }
    }
  }

  // compare records in the employees table with the iam records
  // check for updates and badness discrepancies
  async compareRecords(){
    const discrepancyTypes = UcdlibEmployees.outdatedReasons;
    for ( let employee of this.employees ){

      // check for no iam record
      let iamRecord = this.iamResponses.byId[employee.iam_id];
      if ( this.iam.noEmployeeFound(iamRecord) ){
        this.discrepancies.push({
          iam_id: employee.iam_id,
          reason: discrepancyTypes.noIamRecord
        });
        // most other tests depend on iam record so skip
        continue;
      }

      iamRecord = new IamPersonTransform(iamRecord);

      // check that appointment is specified if there are multiple
      if ( iamRecord.appointments.length > 1 ) {
        const appt = iamRecord.getAssociation(employee.primary_association.deptCode, employee.primary_association.titleCode, true);
        if ( Object.keys(appt).length === 0 ) {
          this.discrepancies.push({
            iam_id: employee.iam_id,
            reason: discrepancyTypes.multipleAppointments.slug
          });
        }
      }

      // check that dept code is found in iam record
      if ( employee.ucd_dept_code ){
        const appts = iamRecord.appointments.filter(appt => appt.deptCode === employee.ucd_dept_code);
        if ( !appts.length ){
          this.discrepancies.push({
            iam_id: employee.iam_id,
            reason: discrepancyTypes.deptCodeNotFound.slug
          });
        }
      }

    }
  }
}

function IamEmployeesError(error) {
  this.error = error;
  this.message = "Error when syncing employees with the UCD IAM API";
}

// syncs records in the employees table with the ucd iam api
export const run = async () => {
  try {
    const iamEmployees = new IamEmployees();
    console.log('Getting employees from the database');
    await iamEmployees.getEmployees();
    console.log('Got employees from the database');

    console.log('Getting iam records for employees and supervisors');
    await iamEmployees.getIamRecords();
    console.log('Got iam records for employees and supervisors');
    
    console.log('Comparing records');
    await iamEmployees.compareRecords();

    console.log(`Found ${iamEmployees.discrepancies.length} discrepancies${iamEmployees.discrepancies.length ? ':' : ''}`);
    for (const discrepancy of iamEmployees.discrepancies) {
      console.log(discrepancy);
    }

    console.log(`${iamEmployees.updates.length} employees were updated${iamEmployees.updates.length ? ':' : ''}`);
    for (const update of iamEmployees.updates) {
      console.log(update);
    }
  } catch (error) {
    throw new IamEmployeesError(error);
  }
  
}