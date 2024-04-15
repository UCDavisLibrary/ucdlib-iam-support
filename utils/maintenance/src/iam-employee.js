import UcdlibEmployees from "@ucd-lib/iam-support-lib/src/utils/employees.js";
import UcdlibCache from '@ucd-lib/iam-support-lib/src/utils/cache.js';
import { UcdIamModel } from "@ucd-lib/iam-support-lib/index.js";
import UcdlibJobs from "@ucd-lib/iam-support-lib/src/utils/jobs.js";
import IamPersonTransform from "@ucd-lib/iam-support-lib/src/utils/IamPersonTransform.js";
import config from "./config.js";
import assert from 'node:assert/strict';

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
    this.employees = employees.res.rows;
  }

  // get iam records for employees and supervisors in employees table
  async getIamRecords(){

    // get iam records for employees and supervisors
    for ( let employee of this.employees ){
      for ( let iamId of [employee.iam_id, employee.supervisor_id]){
        if ( !iamId ) continue;
        await this._getIamRecord(iamId);
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

  async _getIamRecord(id, idType='iamId') {

    // use iam id if we have it
    if ( idType === 'employeeId' && this.employeeIdToIamId[id] ) {
      idType = 'iamId';
      id = this.employeeIdToIamId[id];
    }

    // check class cache
    if ( idType === 'iamId' && this.iamResponses.byId[id] ) {
      return this.iamResponses.byId[id];
    } else if ( idType === 'employeeId' && this.iamResponses.byEmployeeId[id] ) {
      return this.iamResponses.byEmployeeId[id];
    }

    // check database cache
    const cache = await UcdlibCache.get(idType, id, config.ucdIamApi.cacheExpiration);
    if ( cache.res && cache.res.rowCount ) {
      const d = cache.res.rows[0].data;
      if ( idType === 'iamId' ) this.iamResponses.byId[id] = d;
      if ( idType === 'employeeId' ) this.iamResponses.byEmployeeId[id] = d;
      return d;
    }

    // query iam api
    let response;
    if ( idType === 'iamId' ) {
      response = await this.iam.getPersonByIamId(id);
    } else if ( idType === 'employeeId' ) {
      response = await this.iam.getPersonByEmployeeId(id);
    }

    if ( response.error && !this.iam.noEmployeeFound(response) ){
      response.error.message = 'Unable to connect to the UCD IAM API';
      throw response.error;
    }
    if ( !response.error ) {
      await UcdlibCache.set(idType, id, response);
    }
    if ( idType === 'iamId' ) {
      this.iamResponses.byId[id] = response;
      return response;
    }
    if ( idType === 'employeeId' ) {
      this.iamResponses.byEmployeeId[id] = response;
      this.employeeIdToIamId[id] = response.iamId;
      return await this._getIamRecord(response.iamId);
    }
    this.iamResponses.byId[iamId] = response;

  }

  // compare records in the employees table with the ucd iam records
  // check for updates that can be applied automatically, and those that require manual intervention
  async compareRecords(){
    const discrepancyTypes = UcdlibEmployees.outdatedReasons;
    for ( let employee of this.employees ){

      // check for no iam record
      let iamRecord = this.iamResponses.byId[employee.iam_id];
      if ( this.iam.noEmployeeFound(iamRecord) ){
        this.discrepancies.push({
          iam_id: employee.iam_id,
          reason: discrepancyTypes.noIamRecord.slug
        });
        continue;
      }

      iamRecord = new IamPersonTransform(iamRecord);

      // check that employee has an appointment
      if ( !iamRecord.hasAppointment ) {
        this.discrepancies.push({
          iam_id: employee.iam_id,
          reason: discrepancyTypes.noAppointment.slug
        });
        continue;
      }

      // check that appointment is specified if there are multiple
      if ( iamRecord.appointments.length > 1 ) {
        const appt = iamRecord.getAssociation(employee.primary_association.deptCode, employee.primary_association.titleCode, true);
        if ( Object.keys(appt).length === 0 ) {
          this.discrepancies.push({
            iam_id: employee.iam_id,
            reason: discrepancyTypes.multipleAppointments.slug
          });
          continue;
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
          continue;
        }
      }

      // since TES employees do not have a library appointment, check that TES employees appointments are still active
      if ( !UcdlibEmployees.libDeptCodes.includes(employee.ucd_dept_code)) {
        let libApptStart = new Date(employee.created);
        libApptStart.setDate(libApptStart.getDate()-5); // grace period of 5 days
        const iamAppStart = new Date(iamRecord.getPrimaryAssociation().assocStartDate);
        if ( libApptStart < iamAppStart ) {
          this.discrepancies.push({
            iam_id: employee.iam_id,
            reason: discrepancyTypes.appointmentDateAnomaly.slug
          });
          continue;
        }
      }

      // check for user id
      if ( !iamRecord.userId ){
        this.discrepancies.push({
          iam_id: employee.iam_id,
          reason: discrepancyTypes.missingUserId.slug
        });
        continue;
      }

      // compare existing employee record with iam record
      const existingEmployeeRecord = {
        iamId: employee.iam_id,
        employeeId: employee.employee_id,
        userId: employee.user_id,
        email: employee.email,
        firstName: employee.first_name,
        lastName: employee.last_name,
        middleName: employee.middle_name,
        suffix: employee.suffix,
        types: employee.types
      };
      const newEmployeeRecord = {
        iamId: iamRecord.id,
        employeeId: iamRecord.employeeId,
        userId: iamRecord.userId,
        email: iamRecord.email,
        firstName: iamRecord.firstName,
        lastName: iamRecord.lastName,
        middleName: iamRecord.middleName,
        suffix: iamRecord.suffix,
        types: iamRecord.types,
      };
      if ( !employee.custom_supervisor ){
        existingEmployeeRecord.supervisorId = employee.supervisor_id;

        const supervisorEmployeeId = iamRecord.getSupervisorEmployeeId();
        if ( supervisorEmployeeId ) {
          let supervisorIamId = this.employeeIdToIamId[supervisorEmployeeId];
          if ( supervisorIamId ) {
            newEmployeeRecord.supervisorId = supervisorIamId;
          } else {
            const supervisorIamRecord = await this._getIamRecord(supervisorEmployeeId, 'employeeId');
            newEmployeeRecord.supervisorId = supervisorIamRecord.iamId;
          }
        } else {
          newEmployeeRecord.supervisorId = employee.supervisor_id;
        }
      }
      try {
        assert.deepStrictEqual(existingEmployeeRecord, newEmployeeRecord);
      } catch (error) {
        this.updates.push(newEmployeeRecord);
      }

    }
  }

  // updates the employees table with the latest iam records
  async updateEmployees(){
    if ( !this.updates.length ) return;
    for ( let update of this.updates ){
      const r = await UcdlibEmployees.update(update.iamId, update, 'iamId');
      if ( r.err ) {
        throw r.err;
      }
    }
    await this.getEmployees();
  }

  async validateSupervisorIds(){
    const libEmployees = new Set(this.employees.map(e => e.iam_id));
    for (const employee of this.employees) {
      if ( employee.custom_supervisor && !employee.supervisor_id ) continue;

      if ( !libEmployees.has(employee.supervisor_id) ) {
        this.discrepancies.push({
          iam_id: employee.iam_id,
          reason: UcdlibEmployees.outdatedReasons.supervisorNotLibraryEmployee.slug
        });
      }

      if ( !employee.supervisor_id ){
        this.discrepancies.push({
          iam_id: employee.iam_id,
          reason: UcdlibEmployees.outdatedReasons.noSupervisor.slug
        });
      } else {
        const supervisorIamRecord = await this._getIamRecord(employee.supervisor_id, 'iamId');
        if ( this.iam.noEmployeeFound(supervisorIamRecord) ){
          this.discrepancies.push({
            iam_id: employee.iam_id,
            reason: UcdlibEmployees.outdatedReasons.noSupervisorIamRecord.slug
          });
        }
      }
    }
  }

  async writeDiscrepancies(){
    if ( !this.discrepancies.length ) return;
    for (const d of this.discrepancies) {
      const r = await UcdlibEmployees.createRecordDiscrepancyNotification(d.iam_id, d.reason);
      if ( r.err ) {
        throw r.err;
      }
    }
  }
}

function IamEmployeesError(error) {
  this.error = error;
  this.message = "Error when syncing employees with the UCD IAM API";
}

// syncs records in the employees table with the ucd iam api
export const run = async (saveToDB) => {
  let thisJob;
  try {
    if ( saveToDB ) {
      const r = await UcdlibJobs.start('iam-employee');
      if ( r.job ) thisJob = r.job;
    }
    const iamEmployees = new IamEmployees();
    console.log('Getting employees from the database');
    await iamEmployees.getEmployees();
    console.log('Got employees from the database');

    console.log('Getting iam records for employees and supervisors');
    await iamEmployees.getIamRecords();
    console.log('Got iam records for employees and supervisors');

    console.log('Comparing records');
    await iamEmployees.compareRecords();

    await iamEmployees.updateEmployees();
    console.log(`${iamEmployees.updates.length} employees were updated${iamEmployees.updates.length ? ':' : ''}`);
    for (const update of iamEmployees.updates) {
      if ( thisJob ) await thisJob.log({type: 'update', ...update});
      console.log(update);
    }

    await iamEmployees.validateSupervisorIds();
    await iamEmployees.writeDiscrepancies();
    console.log(`Found ${iamEmployees.discrepancies.length} discrepancies${iamEmployees.discrepancies.length ? ':' : ''}`);
    for (const discrepancy of iamEmployees.discrepancies) {
      if ( thisJob ) await thisJob.log({type: 'discrepancy', ...discrepancy});
      console.log(discrepancy);
    }

    if ( thisJob ) {
      const discrepanciesCt = iamEmployees.discrepancies.length;
      const updatesCt = iamEmployees.updates.length;
      await thisJob.end({discrepanciesCt, updatesCt});
    }


  } catch (error) {
    if ( thisJob ) {
      await thisJob.end({error: error.message}, false);
    }
    throw new IamEmployeesError(error);
  }

}
