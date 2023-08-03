import config from './cli-config.js';
import utils from './utils.js';
import iamAdmin from '@ucd-lib/iam-support-lib/src/utils/admin.js';
import UcdlibEmployees from '@ucd-lib/iam-support-lib/src/utils/employees.js';
import pg from '@ucd-lib/iam-support-lib/src/utils/pg.js';
import { UcdlibRt, UcdlibRtTicket } from '@ucd-lib/iam-support-lib/src/utils/rt.js';
import IamPersonTransform from '@ucd-lib/iam-support-lib/src/utils/IamPersonTransform.js';
import {UcdIamModel} from '@ucd-lib/iam-support-lib/index.js';
import * as fs from 'node:fs/promises';

UcdIamModel.init(config.ucdIamApi);


class employeesCli {

  /**
   * @description Update an employee property
   * @param {String} id - Employee unique indentifier
   * @param {String} property - Column name to update
   * @param {String} value - New value
   * @param {*} options
   * @returns
   */
  async updateProperty(id, property, value, options ){
    const idType = options.idtype ? options.idtype : 'iamId';
    id = id.trim();
    const data = {};
    data[property] = value;
    const r = await UcdlibEmployees.update(id, data, idType);
    await pg.client.end();
    if ( r.err ) {
      console.error(`Error updating employee record\n${r.err.message}`);
      return;
    }
    console.log(`Updated ${r.res.rowCount} employee records`);
  }

  async removeEmployee(id, options){
    const idType = options.idtype ? options.idtype : 'iamId';
    id = id.trim();

    // check if employee exists
    let employee = await UcdlibEmployees.getById(id, idType, {returnGroups: true});
    if ( !employee.res.rowCount ) {
      console.error(`Employee ${id} not found`);
      await pg.client.end();
      return;
    }
    employee = employee.res.rows[0];
    const iamId = employee.iam_id;
    if ( !iamId ) {
      console.error(`Error retrieving employee IAM id`);
      await pg.client.end();
      return;
    }

    // check if employee has direct reports
    const directReports = await UcdlibEmployees.getDirectReports(iamId);
    if ( directReports.res.rowCount ) {
      console.error(`Employee has direct reports. Please remove direct reports first.`);
      const colsToShow = ['id', 'iam_id', 'first_name', 'last_name'];
      utils.printTable(directReports.res.rows, colsToShow);
      await pg.client.end();
      return;
    }

    // check if employee is a head of any groups
    const isHeadOf = employee.groups.filter(g => g.isHead);
    if ( isHeadOf.length && !options.force ) {
      console.error(`Employee is head of the following groups. You might want to set a new head first, but you can use --force to override this check.`);
      utils.printTable(isHeadOf);
      await pg.client.end();
      return;
    }

    // remove groups
    const rmGroups = await UcdlibEmployees.removeAllGroupMemberships(employee.id);
    if ( rmGroups.err ) {
      console.error(`Error removing employee from groups\n${rmGroups.err.message}`);
      await pg.client.end();
      return;
    }

    // remove employee
    const rmEmployee = await UcdlibEmployees.delete(id, idType);
    if ( rmEmployee.err ) {
      console.error(`Error removing employee\n${rmEmployee.err.message}`);
      await pg.client.end();
      return;
    }

    // mark any notifications as dismissed
    const dismissNotifications = await UcdlibEmployees.dismissRecordDiscrepancyNotifications(iamId);
    if ( dismissNotifications.err ) {
      console.error(`Error dismissing record discrepancy notifications\n${dismissNotifications.err.message}`);
      await pg.client.end();
      return;
    }

    console.log(`Record removed:`);
    utils.logObject(employee);

    await pg.client.end();
  }

  /**
   * @description Search for existing library employees
   * @param {String} name - Employee name
   * @param {*} options
   * @returns
   */
  async search(name, options){
    let r = await UcdlibEmployees.searchByName(name);

    utils.logObject(r.res.rows);
    await pg.client.end();
  }

  /**
   * @description Get an employee by id
   * @param {String} id - Employee unique indentifier
   * @param {*} options
   */
  async get(id, options){
    const idType = options.idtype ? options.idtype : 'iamId';
    id = id.trim();
    const r = await UcdlibEmployees.getById(id, idType, {returnGroups: true, returnSupervisor: true});
    await pg.client.end();
    if ( r.res.rowCount ) {
      utils.logObject(r.res.rows);
    } else {
      console.log(`Employee ${id} not found`);
    }
  }


  /**
   * @description Adopt an employee into the Library IAM database
   * @param {String} onboardingId - Onboarding record id
   * @param {Object} options - Options object from commander
   */
  async adopt(onboardingId, options){
    console.log(`Adopting employee from onboarding record ${onboardingId} with options:`, options);

    const forceMessage = 'Use --force to override this check.';

    const adoptParams = {
      ucdIamConfig: config.ucdIamApi,
      force: options.force,
      sendRt: options.rt,
      rtConfig: config.rt
    };
    if ( config.rt.forbidWrite ) adoptParams.sendRt = false;

    const result = await iamAdmin.adoptEmployee(onboardingId, adoptParams);
    if ( result.error ) {
      let msg = `Error adopting employee!\n${result.message}.`;
      if ( result.canForce ) msg += `\n${forceMessage}`;
      if ( result.canForce && result.forceMessage ) msg += `\n${result.forceMessage}`;
      console.error(msg);
      pg.client.end();
      return;
    }

    if ( options.provision ) {
      const kcParams = {
        keycloakConfig: {...config.keycloakAdmin, refreshInterval: 58000},
        printLogs: true
      };
      const kcResult = await iamAdmin.provisionKcAccount(result.employeeId, kcParams);
      if ( kcResult.error ) {
        await iamAdmin.deleteEmployee(result.employeeId);
        let msg = `Error provisioning keycloak account!\n${kcResult.message}.`;
        console.error(msg);
        pg.client.end();
        return;
      }

    }

    // comment on rt ticket
    if ( options.rt && !config.rt.forbidWrite && result.onboardingRecord.rt_ticket_id) {
      const rtClient = new UcdlibRt(config.rt);
      const ticket = new UcdlibRtTicket(false, {id: result.onboardingRecord.rt_ticket_id});
      const reply = ticket.createReply();
      reply.addSubject('Employee Record Added');
      reply.addContent('This employee was adopted into the UC Davis Library Identity and Access Management System');
      const rtResponse = await rtClient.sendCorrespondence(reply);
      if ( rtResponse.err )  {
        console.error('Error sending RT correspondence');
        console.error(rtResponse);
      }
    }

    console.log(result.message);
    console.log(`Employee adopted with id ${result.employeeId}.`);
    await pg.client.end();
  }

  /**
   * @description Dismiss all record discrepancy notifications for an employee
   * @param {String} iamId - Employee IAM id
   */
  async dismissRecordDiscrepancyNotifications(iamId){
    const r = await UcdlibEmployees.dismissRecordDiscrepancyNotifications(iamId);
    await pg.client.end();
    if ( r.err) {
      console.error(`Error dismissing record discrepancy notifications\n${r.err.message}`);
      return;
    }
    console.log(`Dismissed ${r.res.rowCount} record discrepancy notifications`);
  }

  async listActiveRecordDiscrepancyNotifications(intervalLength, intervalUnit){
    let interval = '';
    if ( intervalLength && intervalUnit ) {
      interval = `${intervalLength} ${intervalUnit}`;
    }
    const r = await UcdlibEmployees.getActiveRecordDiscrepancyNotifications(interval);
    await pg.client.end();
    if ( r.err ) {
      console.error(`Error getting active record discrepancy notifications\n${r.err.message}`);
      return;
    }
    if ( r.res.rowCount === 0 ){
      console.log('No active record discrepancy notifications found');
      return;
    }
    utils.printTable(r.res.rows);
  }

  async updateCreationDate(id, idtype){
    const r = await iamAdmin.updateEmployeeCreationDate(id, idtype);
    console.log(`${r.error ? 'Error:' : 'Success:'} ${r.message}`);
    await pg.client.end();
  }

  async createTemplate(name){
    const template = {
      "iam_id": "",
      "first_name": "",
      "last_name": "",
      "middle_name": "",
      "title": "",
      "supervisor_id": "",
      "custom_supervisor": false,
      "primary_association": {
        "deptCode": "",
        "titleCode": ""
      },
      "groups": [
        {
          "id": "",
          "isHead": false
        }
      ]
    }

    // write template to json file
    if ( !name.endsWith('.json') ) name += '.json';
    await fs.writeFile(name, JSON.stringify(template, null, 2));

  }

  async updatePrimaryAssociation(id, deptCode, titleCode, options){
    const idType = options.idtype ? options.idtype : 'iamId';
    id = id.trim();

    // check if employee exists
    const employee = await utils.validateEmployee(id, idType);
    if ( !employee ) return;

    // check for iam record
    const iamRecord = await utils.validateIamRecord(employee.iam_id);
    if ( !iamRecord ) return;

    if ( iamRecord.appointments.length <= 1 ){
      console.error(`Employee has only one appointment. No need to update primary association.`);
      await pg.client.end();
      return;
    }

    const association = iamRecord.getAssociation(deptCode, titleCode, true);
    if ( !Object.keys(association).length ) {
      console.error(`Employee does not have an appointment with department code ${deptCode} and title code ${titleCode}`);
      console.log('Available appointments:');
      utils.logObject(iamRecord.appointments);
      await pg.client.end();
      return;
    }

    // validate supervisor
    let supervisorId;
    if ( !employee.custom_supervisor ){
      const supervisorEmployeeId = iamRecord.getSupervisorEmployeeId();
      if ( !supervisorEmployeeId ) {
        console.error(`Error: Appointment does not have a supervisor listed`);
        console.error('Set custom_supervisor on the employee record to skip setting the supervisor');
        await pg.client.end();
        return;
      }
      const supervisor = await UcdIamModel.getPersonByEmployeeId(supervisorEmployeeId);
      if ( supervisor.error ) {
        if ( !UcdIamModel.noEmployeeFound(supervisor) ) {
          console.log(`Error interacting with IAM API: ${supervisor.message}`);
          console.error('Set custom_supervisor on the employee record to skip setting the supervisor');
        } else {
          console.log(`No record found for supervisor ${supervisorEmployeeId} in UCD IAM`);
          console.error('Set custom_supervisor on the employee record to skip setting the supervisor');
        }
        await pg.client.end();
        return
      }
      supervisorId = supervisor.iamId;
    }

    // update employee record
    const d = {primaryAssociation: {deptCode, titleCode}, ucdDeptCode: deptCode};
    if ( supervisorId ) d.supervisorId = supervisorId;
    const update = await UcdlibEmployees.update(employee.id, d);
    if ( update.err ) {
      console.error(`Error updating employee record\n${update.err.message}`);
    } else {
      console.log(`Updated primary association of ${employee.first_name} ${employee.last_name}`);
    }

    await pg.client.end();

  }

  async resetPrimaryAssociation(id, options){
    const idType = options.idtype ? options.idtype : 'iamId';
    id = id.trim();

    // check if employee exists
    const employee = await utils.validateEmployee(id, idType);
    if ( !employee ) return;

    // check for iam record
    const iamRecord = await utils.validateIamRecord(employee.iam_id);
    if ( !iamRecord ) return;

    if ( iamRecord.appointments.length > 1 ){
      console.error(`Employee has more than one appointment. Use the update-primary-association command to set a new primary association.`);
      await pg.client.end();
      return;
    }
    if ( !iamRecord.appointments.length ){
      console.error(`Employee has no appointments. Cannot reset primary association.`);
      await pg.client.end();
      return;
    }

    // validate supervisor
    let supervisorId;
    if ( !employee.custom_supervisor ){
      const supervisorEmployeeId = iamRecord.getSupervisorEmployeeId();
      if ( !supervisorEmployeeId ) {
        console.error(`Error: Appointment does not have a supervisor listed`);
        console.error('Set custom_supervisor on the employee record to skip setting the supervisor');
        await pg.client.end();
        return;
      }
      const supervisor = await UcdIamModel.getPersonByEmployeeId(supervisorEmployeeId);
      if ( supervisor.error ) {
        if ( !UcdIamModel.noEmployeeFound(supervisor) ) {
          console.log(`Error interacting with IAM API: ${supervisor.message}`);
          console.error('Set custom_supervisor on the employee record to skip setting the supervisor');
        } else {
          console.log(`No record found for supervisor ${supervisorEmployeeId} in UCD IAM`);
          console.error('Set custom_supervisor on the employee record to skip setting the supervisor');
        }
        await pg.client.end();
        return
      }
      supervisorId = supervisor.iamId;
    }

    // update employee record
    const d = {primaryAssociation: {}, ucdDeptCode: iamRecord.getPrimaryAssociation().deptCode};
    if ( supervisorId ) d.supervisorId = supervisorId;
    const update = await UcdlibEmployees.update(employee.id, d);
    if ( update.err ) {
      console.error(`Error updating employee record\n${update.err.message}`);
    } else {
      console.log(`Reset primary association of ${employee.first_name} ${employee.last_name}`);
    }
    await pg.client.end();
  }

  async addToDb(file, options){
    const forceMessage = 'Use --force to override this check.';
    const force = options.force;
    let dataToWrite = {};

    // Read employee template file
    const fileContents = await fs.readFile(file, 'utf8');
    const employee = JSON.parse(fileContents);
    const iamId = employee.iam_id;
    if ( !iamId ) {
      console.error(`Iam id is required`);
      return;
    }

    // check if employee exists in uc davis iam
    let iamRecord = await UcdIamModel.getPersonByIamId(iamId);
    if ( iamRecord.error ) {
      console.error(`Unable to retrieve UC Davis IAM record for ${iamId}`);
      console.log(iamRecord);
      return;
    }
    iamRecord = new IamPersonTransform(iamRecord);

    // check if employee already exists in local db
    // const localRecord = await UcdlibEmployees.getById(iamId, 'iamId');
    // if ( localRecord.res.rowCount ) {
    //   await pg.client.end();
    //   console.error(`Employee ${iamId} already exists in local database`);
    //   console.error('Use the update command if you need to update the record');
    //   return;
    // }

    // Check has basic employee data
    let args = {
      iamRecord,
      templateRecord: employee,
      force
    }
    let d = iamAdmin.extractAndPopulateEmployeeFields(args);
    if ( d.error ) {
      console.error(`Error validating employee data\n${d.error.message}`);
      if ( d.error.canForce ) console.error(forceMessage);
      await pg.client.end();
      return;
    }
    dataToWrite = {...dataToWrite, ...d.employeeData};

    // validate appointments
    const primaryAssociation = employee.primary_association?.deptCode || employee.primary_association?.titleCode ? employee.primary_association : {};
    const appointments = await iamAdmin.validateAppointments(iamRecord, primaryAssociation, force);
    if ( appointments.error ) {
      console.error(`Error validating appointments\n${appointments.error.message}`);
      if ( appointments.error.canForce ) console.error(forceMessage);
      await pg.client.end();
      return;
    }
    dataToWrite.primaryAssociation = primaryAssociation;
    dataToWrite.ucdDeptCode = iamRecord.getPrimaryAssociation().deptCode;

    // validate supervisor
    if ( employee.supervisor_id ) {
      const supervisor = await iamAdmin.employeeRecordsExist(employee.supervisor_id, force);
      if ( supervisor.error ) {
        console.error(`Error validating supervisor\n${supervisor.error.message}`);
        if ( supervisor.error.canForce ) console.error(forceMessage);
        await pg.client.end();
        return;
      }
      if ( supervisor.iamRecord.employeeId != iamRecord.getSupervisorEmployeeId() && !force ) {
        console.error(`Error validating supervisor`);
        console.error(`Specified supervisor not listed in primary association of UC Davis IAM record`);
        console.error(`Use --force to override this check`);
        await pg.client.end();
        return;
      }
    }

    // validate groups
    const groups = await iamAdmin.validateGroupList(employee.groups, false, force);
    if ( groups.error ) {
      console.error(`Error validating groups\n${groups.error.message}`);
      if ( groups.error.canForce ) console.error(forceMessage);
      await pg.client.end();
      return;
    }
    console.log(dataToWrite)
    await pg.client.end();

  }

}

export default new employeesCli();
