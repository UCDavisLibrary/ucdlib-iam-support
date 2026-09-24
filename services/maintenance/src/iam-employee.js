import assert from 'node:assert/strict';

import models from '#models';
import IamPersonTransform from "#lib/utils/IamPersonTransform.js";
import rosetta from '#lib/utils/rosetta.js';
import RosettaPerson from '#lib/utils/RosettaPerson.js';
import config from "#lib/utils/config.js";

export class IamEmployees {
  constructor(){

    this.employees = [];
    this.iamResponsesById = {};
    this.discrepancies = [];
    this.updates = [];
  }

  // get records from local employees table
  async getEmployees(){
    const employees = await models.employees.getAll();
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
  }

  async _getIamRecord(id) {
    const idType = 'iamId';

    // check class cache
    if ( this.iamResponsesById[id] ) {
      return this.iamResponsesById[id];
    }
    
    // check database cache
    const cache = await models.cache.get(`rosetta-${idType}`, id, config.rosetta.cacheExpiration);
    if ( cache.res && cache.res.rowCount ) {
      const d = cache.res.rows[0].data;
      this.iamResponsesById[id] = d;
      return d;
    }

    // query iam api
    const response = await rosetta.getPeople({iamid: id, limit: 1});
    if ( response.results.length ) {
      await models.cache.set(`rosetta-${idType}`, id, response.results[0]);
      this.iamResponsesById[id] = response.results[0];
      return response.results[0];
    }
  }

  // compare records in the employees table with the ucd iam records
  // check for updates that can be applied automatically, and those that require manual intervention
  async compareRecords(){
    const discrepancyTypes = models.employees.outdatedReasons;
    for ( let employee of this.employees ){

      // check for no iam record
      let iamRecord = this.iamResponsesById[employee.iam_id];
      if ( !iamRecord ){
        this.discrepancies.push({
          iam_id: employee.iam_id,
          reason: discrepancyTypes.noIamRecord.slug
        });
        continue;
      }

      iamRecord = new RosettaPerson(iamRecord);

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
        let primaryAssociation;
        // rosetta format
        if ( employee.primary_association?.primaryPositionNumber ){
          primaryAssociation = iamRecord.appointments.find(appt => appt.position_number == employee.primary_association.primaryPositionNumber);
        // legacy iam format
        } else if ( employee.primary_association?.deptCode && employee.primary_association?.titleCode ){
          primaryAssociation = iamRecord.appointments.find(appt => appt.department_id == employee.primary_association.deptCode && appt.job_type_id === employee.primary_association.titleCode);
        }

        if ( primaryAssociation ) {
          iamRecord.primaryPositionNumber = primaryAssociation.position_number;
        } else {
          this.discrepancies.push({
            iam_id: employee.iam_id,
            reason: discrepancyTypes.multipleAppointments.slug
          });
          continue;
        }
      }

      // check that dept code is found in iam record
      if ( employee.ucd_dept_code ){
        const appts = iamRecord.appointments.filter(appt => appt.department_id === employee.ucd_dept_code);
        if ( !appts.length ){
          this.discrepancies.push({
            iam_id: employee.iam_id,
            reason: discrepancyTypes.deptCodeNotFound.slug
          });
          continue;
        }
      }

      // since TES employees do not have a library appointment, check that TES employees appointments are still active
      if ( !models.employees.libDeptCodes.includes(employee.ucd_dept_code)) {
        let libApptStart = new Date(employee.created);
        libApptStart.setDate(libApptStart.getDate()+14); // grace period of 14 days
        const iamAppStart = new Date(iamRecord.primaryAssociation.start_date);
        if ( isNaN(iamAppStart) || libApptStart < iamAppStart ) {
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
        types: iamRecord.types,
      };

      // compare supervisor ids
      if ( !employee.custom_supervisor ){
        existingEmployeeRecord.supervisorId = employee.supervisor_id;
        newEmployeeRecord.supervisorId = employee.supervisor_id;

        const supervisorIamId = iamRecord.primaryAssociation?.reports_to_iam_id;
        if ( supervisorIamId ) {
          newEmployeeRecord.supervisorId = supervisorIamId;
        }
      }

      // compare primary appointment
      if ( iamRecord.appointments.length === 1 ) {
        existingEmployeeRecord.primaryAssociation = employee.primary_association;
        const pa = iamRecord.primaryAssociation;
        newEmployeeRecord.primaryAssociation = {
          primaryPositionNumber: pa?.position_number,
        };
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
      const r = await models.employees.update(update.iamId, update, 'iamId');
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
          reason: models.employees.outdatedReasons.supervisorNotLibraryEmployee.slug
        });
      }

      if ( !employee.supervisor_id ){
        this.discrepancies.push({
          iam_id: employee.iam_id,
          reason: models.employees.outdatedReasons.noSupervisor.slug
        });
      } else {
        const supervisorIamRecord = await this._getIamRecord(employee.supervisor_id);
        if ( !supervisorIamRecord ){
          this.discrepancies.push({
            iam_id: employee.iam_id,
            reason: models.employees.outdatedReasons.noSupervisorIamRecord.slug
          });
        }
      }
    }
  }

  async writeDiscrepancies(){
    if ( !this.discrepancies.length ) return;
    for (const d of this.discrepancies) {
      const r = await models.employees.createRecordDiscrepancyNotification(d.iam_id, d.reason);
      if ( r.err ) {
        throw r.err;
      }
    }
  }
}

class IamEmployeesError extends Error {
  constructor(error) {
    super("Error when syncing employees with the UCD IAM API");
    this.name = 'IamEmployeesError';
    this.error = error;
  }
}

// syncs records in the employees table with the ucd iam api
export const run = async (saveToDB) => {
  let thisJob;
  try {
    if ( saveToDB ) {
      const r = await models.jobs.start('iam-employee');
      if ( r.job ) thisJob = r.job;
    }
    const iamEmployees = new IamEmployees();
    console.log('Getting employees from the database');
    await iamEmployees.getEmployees();
    console.log(`Got ${iamEmployees.employees.length} employees from the database`);

    console.log('Getting iam records for employees and supervisors');
    await iamEmployees.getIamRecords();
    console.log(`Got iam records for ${Object.keys(iamEmployees.iamResponsesById).length} unique iam ids`);

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
