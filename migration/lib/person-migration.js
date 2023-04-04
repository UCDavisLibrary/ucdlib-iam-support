import UcdlibCache from '@ucd-lib/iam-support-lib/src/utils/cache.js';
import { UcdIamModel } from "@ucd-lib/iam-support-lib/index.js";
import IamPersonTransform from "@ucd-lib/iam-support-lib/src/utils/IamPersonTransform.js";
import UcdlibEmployees from "@ucd-lib/iam-support-lib/src/utils/employees.js";
import groupMigration from "./group-migration.js";

import * as dotenv from 'dotenv' 
dotenv.config();

class PersonMigration {
  constructor() {

    this.iamRecords = {};
    this.employeeIdToIamId = {};
    this.iamIdToTableId = {};

    // instantiate iam connection
    this.iam = UcdIamModel;
    this.iam.init(process.env.UCD_IAM_API_KEY);
  }

  // Retrieve and import people from iam
  async importPeople(people) {
    for (let person of people){
      const iamRecord = await this.getIamRecord(person.iamId);
      await this.validatePerson(person, iamRecord);
      const personToWrite = {
        iamId: person.iamId,
        employeeId: iamRecord.employeeId,
        userId: iamRecord.userId,
        email: iamRecord.email,
        firstName: iamRecord.firstName,
        lastName: iamRecord.lastName,
        middleName: iamRecord.middleName,
        suffix: iamRecord.suffix,
        title: person.title,
        ucdDeptCode: iamRecord.primaryAssociation.deptCode,
        types: iamRecord.types,
        primaryAssociation: person.appointment || {},
      };

      if ( person.hasOwnProperty('reportsTo') ) {
        personToWrite.supervisorId = person.reportsTo;
        personToWrite.customSupervisor = true;
      } else {
        const supervisor = await this.getIamRecord(iamRecord.supervisorEmployeeId, 'employeeId');
        personToWrite.supervisorId = supervisor.id;
      }
      this.checkForMissingFields(personToWrite);

      // write to db
      const personExists = await UcdlibEmployees.getById(personToWrite.iamId, 'iamId');
      if ( personExists.res.rowCount ){
        this.iamIdToTableId[personToWrite.iamId] = personExists.res.rows[0].id;
      } else {
        console.log('importing person:');
        console.log(personToWrite);
        const personResult = await UcdlibEmployees.create(personToWrite);
        this.iamIdToTableId[personToWrite.iamId] = personResult.res.rows[0].id;
      }
      await this.addPersonToGroups(person);
    }
  }

  async validatePerson(person, iamRecord) {

    // check for appointment - throw error if none
    if (  !iamRecord.hasAppointment ){
      throw new Error('No appointment found for '+person.iamId);
    }

    // check for multiple appointments - throw error if not specified
    if ( iamRecord.appointments.length > 1 ){
      const errorText = 'Multiple appointments found for '+person.iamId + ' and no appointment specified';
      if ( !person.appointment || !Object.keys(iamRecord.getAssociation(person.appointment.deptCode, person.appointment.titleCode, true)).length ){
        throw new Error(errorText);
      }
    }

    // check for supervisor - throw error if none
    if ( person.hasOwnProperty('reportsTo') ){

      if ( person.reportsTo ){
        const supervisor = await this.getIamRecord(person.reportsTo);
        if ( supervisor.error ){
          console.log(supervisor)
          throw new Error('Error getting iam record for supervisor of '+person.iamId);
        }
      } else {
        // this is the UL. We don't care who the UL reports to.
      }

    } else if ( !iamRecord.supervisorEmployeeId ) {
      throw new Error('No supervisor found for '+person.iamId);
    } else {
      // check if supervisor is not in library - throw error if not 
      const supervisor = await this.getIamRecord(iamRecord.supervisorEmployeeId, 'employeeId');
      if ( supervisor.error ){
        console.log(supervisor)
        throw new Error('Error getting iam record for supervisor of '+person.iamId);
      }
      if ( !supervisor.isLibraryEmployee ){
        throw new Error('Supervisor '+iamRecord.supervisorEmployeeId +' of '+person.iamId+' is not a library employee');
      }
    }

    
  }

  checkForMissingFields(personRecord){
    const fields = ['employeeId', 'userId', 'email', 'firstName', 'lastName'];
    for (let field of fields){
      if ( !personRecord[field] ) {
        console.warn('Missing field: '+field+' for '+personRecord.iamId);
      }
    }
  }

  async addPersonToGroups(person) {
    const groups = [];
    if ( person.managementCouncil ) groups.push({id: groupMigration.groupBySlug['management-council'].id});
    if ( person.execCouncil ) groups.push({id: groupMigration.groupBySlug['executive-council'].id});
    groups.push({id: groupMigration.groupBySlug[person.department].id, deptHead: person.isDepartmentHead});
    for (const group of groups) {
      await UcdlibEmployees.addEmployeeToGroup(this.iamIdToTableId[person.iamId], group.id, group.deptHead);
    }
  } 

  // get iam record, cache it, and return it
  async getIamRecord(id, idType='iamId') {

    let iamId = idType === 'iamId' ? id : '';
    let employeeId = idType === 'employeeId' ? id : '';
    if ( employeeId && this.employeeIdToIamId[employeeId] ) iamId = this.employeeIdToIamId[employeeId];

    if ( iamId && this.iamRecords[iamId] ) {
      return this.iamRecords[iamId];
    }

    const r = await UcdlibCache.get(idType, id);
    if (r.err) {
      throw new Error(r.err);
    } else if (r.res.rows.length) {
      return new IamPersonTransform(r.res.rows[0].data);
    }
    let iamRecord = {};

    // get iamid from employeeId
    if ( employeeId ) {
      iamRecord = await this.iam.getPersonByEmployeeId(employeeId);
      if ( iamRecord.error) {
        console.log(iamRecord);
        throw new Error('Error getting iam record for employee id '+employeeId);
      }
      iamId = iamRecord.iamId;
    }
    
    // get iam record from iamId
    if ( iamId ) {
      iamRecord = await this.iam.getPersonByIamId(iamId);
    } else {
      console.log(iamRecord);
      throw new Error('No iamId found for employeeId '+employeeId);
    }
    
    if ( iamRecord.error ){
      console.log(iamRecord)
      throw new Error('Error getting iam record for '+iamId);
    }
    await UcdlibCache.set('iamId', iamId, iamRecord);
    if ( iamRecord.employeeId ) {
      await UcdlibCache.set('employeeId', iamRecord.employeeId, iamRecord);
    }
    iamRecord = new IamPersonTransform(iamRecord);
    this.iamRecords[iamId] = iamRecord;
    this.employeeIdToIamId[iamRecord.employeeId] = iamId;
    return iamRecord;
  }
}

export default new PersonMigration();