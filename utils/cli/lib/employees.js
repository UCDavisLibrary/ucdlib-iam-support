import config from './cli-config.js';
import utils from './utils.js';
import iamAdmin from '@ucd-lib/iam-support-lib/src/utils/admin.js';
import UcdlibEmployees from '@ucd-lib/iam-support-lib/src/utils/employees.js';
import pg from '@ucd-lib/iam-support-lib/src/utils/pg.js';
import { UcdlibRt, UcdlibRtTicket } from '@ucd-lib/iam-support-lib/src/utils/rt.js';
import IamPersonTransform from '@ucd-lib/iam-support-lib/src/utils/IamPersonTransform.js';
import {UcdIamModel} from '@ucd-lib/iam-support-lib/index.js';
import UcdlibSeparation from '@ucd-lib/iam-support-lib/src/utils/separation.js';
import keycloakClient from "@ucd-lib/iam-support-lib/src/utils/keycloakAdmin.js";
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
    await pg.pool.end();
    if ( r.err ) {
      console.error(`Error updating employee record\n${r.err.message}`);
      return;
    }
    console.log(`Updated ${r.res.rowCount} employee records`);
  }

  async separate(separationId, options){
    let separationRecord = await UcdlibSeparation.getById(separationId);
    if ( !separationRecord.res.rowCount ) {
      console.error(`Separation request ${separationId} not found`);
      await pg.pool.end();
      return;
    }
    separationRecord = separationRecord.res.rows[0];
    const iamId = separationRecord.iam_id;
    if ( !iamId ) {
      console.error(`Separation request ${separationId} does not have an IAM id`);
      await pg.pool.end();
      return;
    }
    let userId = separationRecord.additional_data?.employeeUserId;

    if ( options.rm ) {
      let employeeRecord = await UcdlibEmployees.getById(iamId, 'iamId');
      if ( !employeeRecord.res.rowCount ) {
        console.error(`Employee ${iamId} not found in employee table`);
        await pg.pool.end();
        return;
      }
      employeeRecord = employeeRecord.res.rows[0];
      if ( !employeeRecord.user_id ){
        console.error(`Employee ${iamId} does not have a user_id, which is the keycloak id`);
        await pg.pool.end();
        return;
      }
      userId = employeeRecord.user_id;
    }

    if ( options.deprovision ){
      await keycloakClient.init({...config.keycloakAdmin, refreshInterval: 58000});
      let keycloakUser = await keycloakClient.getUserByUserName(userId);
      if ( !keycloakUser ) {
        console.error(`Employee ${userId} not found in keycloak`);
        await pg.pool.end();
        keycloakClient.stopRefreshInterval();
        return;
      }
      keycloakUser = keycloakUser[0];
      await keycloakClient.client.users.del({id: keycloakUser.id});
      keycloakClient.stopRefreshInterval();
      console.log(`User ${keycloakUser.id} removed from ${config.keycloakAdmin.baseUrl}`);
    }

    if ( options.rm ) {
      await this.removeEmployee(iamId, {keepPoolOpen: true});
    }

    if ( options.rt && separationRecord.rt_ticket_id ) {
      const rtClient = new UcdlibRt(config.rt);
      const ticket = new UcdlibRtTicket(false, {id: separationRecord.rt_ticket_id});
      const reply = ticket.createReply();
      reply.addSubject('Employee Access Was Removed');
      reply.addContent('This employee was removed from the UC Davis Library Identity and Access Management System.');
      const rtResponse = await rtClient.sendCorrespondence(reply);
      if ( rtResponse.err )  {
        console.error('Error sending RT correspondence');
        console.error(rtResponse);
      }
    }

    await pg.pool.end();
  }

  async removeEmployee(id, options){
    const idType = options.idtype ? options.idtype : 'iamId';
    id = id.trim();

    // check if employee exists
    let employee = await UcdlibEmployees.getById(id, idType, {returnGroups: true, returnSupervisor: true});
    if ( !employee.res.rowCount ) {
      console.error(`Employee ${id} not found`);
      await pg.pool.end();
      return;
    }
    employee = employee.res.rows[0];
    const iamId = employee.iam_id;
    if ( !iamId ) {
      console.error(`Error retrieving employee IAM id`);
      await pg.pool.end();
      return;
    }

    // check if employee has direct reports
    const directReports = await UcdlibEmployees.getDirectReports(iamId);
    if ( directReports.res.rowCount ) {
      console.error(`Employee has direct reports. Please remove direct reports first.`);
      const colsToShow = ['id', 'iam_id', 'first_name', 'last_name'];
      utils.printTable(directReports.res.rows, colsToShow);
      await pg.pool.end();
      return;
    }

    // check if employee is a head of any groups
    const isHeadOf = employee.groups.filter(g => g.isHead);
    if ( isHeadOf.length && !options.force ) {
      console.error(`Employee is head of the following groups. You might want to set a new head first, but you can use --force to override this check.`);
      utils.printTable(isHeadOf);
      await pg.pool.end();
      return;
    }

    // remove groups
    const rmGroups = await UcdlibEmployees.removeAllGroupMemberships(employee.id);
    if ( rmGroups.err ) {
      console.error(`Error removing employee from groups\n${rmGroups.err.message}`);
      await pg.pool.end();
      return;
    }

    // remove employee
    const rmEmployee = await UcdlibEmployees.delete(id, idType);
    if ( rmEmployee.err ) {
      console.error(`Error removing employee\n${rmEmployee.err.message}`);
      await pg.pool.end();
      return;
    }

    // mark any notifications as dismissed
    const dismissNotifications = await UcdlibEmployees.dismissRecordDiscrepancyNotifications(iamId);
    if ( dismissNotifications.err ) {
      console.error(`Error dismissing record discrepancy notifications\n${dismissNotifications.err.message}`);
      await pg.pool.end();
      return;
    }

    console.log(`Record removed:`);
    utils.logObject(employee);

    if ( !options.keepPoolOpen ){
      await pg.pool.end();
    }
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
    await pg.pool.end();
  }

  /**
   * @description Get an employee by id
   * @param {String} id - Employee unique indentifier
   * @param {*} options
   */
  async get(id, options){
    const idType = options.idtype ? options.idtype : 'iamId';
    const ucd = options.ucd;
    id = id.trim();

    if(ucd) {
      let iamRecord;
      switch (idType) {
        case 'employeeId':
          iamRecord = await UcdIamModel.getPersonByEmployeeId(id);
          break;
        case 'userId':
          iamRecord = await UcdIamModel.getPersonByUserId(id);
          break;
        case 'email':
          iamRecord = await UcdIamModel.getPersonByEmail(id);
          break;
        default:
          iamRecord = await UcdIamModel.getPersonByIamId(id);
      }
       
      if ( iamRecord.error ) {
        console.error(`Unable to retrieve UC Davis IAM record for ${id}`);
        console.log(iamRecord);
        return;
      }
      iamRecord = new IamPersonTransform(iamRecord);
      console.log("IAM Record:");
      utils.logObject(iamRecord);

    }

    const r = await UcdlibEmployees.getById(id, idType, {returnGroups: true, returnSupervisor: true});
    await pg.pool.end();
    if ( r.res.rowCount ) {
      console.log("Employee Record:");
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
      await pg.pool.end();
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
        await pg.pool.end();
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
    await pg.pool.end();
  }

  /**
   * @description Dismiss all record discrepancy notifications for an employee
   * @param {String} iamId - Employee IAM id
   */
  async dismissRecordDiscrepancyNotifications(iamId){
    const r = await UcdlibEmployees.dismissRecordDiscrepancyNotifications(iamId);
    await pg.pool.end();
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
    await pg.pool.end();
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
    await pg.pool.end();
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
      await pg.pool.end();
      return;
    }

    const association = iamRecord.getAssociation(deptCode, titleCode, true);
    if ( !Object.keys(association).length ) {
      console.error(`Employee does not have an appointment with department code ${deptCode} and title code ${titleCode}`);
      console.log('Available appointments:');
      utils.logObject(iamRecord.appointments);
      await pg.pool.end();
      return;
    }

    // validate supervisor
    let supervisorId;
    if ( !employee.custom_supervisor ){
      const supervisorEmployeeId = iamRecord.getSupervisorEmployeeId();
      if ( !supervisorEmployeeId ) {
        console.error(`Error: Appointment does not have a supervisor listed`);
        console.error('Set custom_supervisor on the employee record to skip setting the supervisor');
        await pg.pool.end();
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
        await pg.pool.end();
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

    await pg.pool.end();

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
      await pg.pool.end();
      return;
    }
    if ( !iamRecord.appointments.length ){
      console.error(`Employee has no appointments. Cannot reset primary association.`);
      await pg.pool.end();
      return;
    }

    // validate supervisor
    let supervisorId;
    if ( !employee.custom_supervisor ){
      const supervisorEmployeeId = iamRecord.getSupervisorEmployeeId();
      if ( !supervisorEmployeeId ) {
        console.error(`Error: Appointment does not have a supervisor listed`);
        console.error('Set custom_supervisor on the employee record to skip setting the supervisor');
        await pg.pool.end();
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
        await pg.pool.end();
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
    await pg.pool.end();
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
    const localRecord = await UcdlibEmployees.getById(iamId, 'iamId');
    if ( localRecord.res.rowCount ) {
      await pg.pool.end();
      console.error(`Employee ${iamId} already exists in local database`);
      console.error('Use the update-property command if you need to update the record');
      return;
    }

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
      await pg.pool.end();
      return;
    }
    dataToWrite = {...dataToWrite, ...d.employeeData};

    // validate appointments
    const primaryAssociation = employee.primary_association?.deptCode || employee.primary_association?.titleCode ? employee.primary_association : {};
    const appointments = await iamAdmin.validateAppointments(iamRecord, primaryAssociation, force);
    if ( appointments.error ) {
      console.error(`Error validating appointments\n${appointments.error.message}`);
      if ( appointments.error.canForce ) console.error(forceMessage);
      await pg.pool.end();
      return;
    }
    dataToWrite.primaryAssociation = primaryAssociation;
    dataToWrite.ucdDeptCode = iamRecord.getPrimaryAssociation().deptCode;

    // validate supervisor

    // user entered supervisor id
    if ( employee.supervisor_id ) {
      const supervisor = await iamAdmin.employeeRecordsExist(employee.supervisor_id, force);
      if ( supervisor.error ) {
        console.error(`Error validating supervisor\n${supervisor.error.message}`);
        if ( supervisor.error.canForce ) console.error(forceMessage);
        await pg.pool.end();
        return;
      }
      if ( !employee.custom_supervisor && supervisor.iamRecord.employeeId != iamRecord.getSupervisorEmployeeId() ) {
        console.error(`Error validating supervisor`);
        console.error(`Specified supervisor not listed in primary association of UC Davis IAM record`);
        console.error("The 'custom_supervisor' property should be set to true");
        await pg.pool.end();
        return;
      }
    } else {
      // user did not provide a supervisor id, so we need to validate appointment supervisor is in our db
      const supervisorEmployeeId = iamRecord.getSupervisorEmployeeId();
      if ( !supervisorEmployeeId ) {
        console.error(`Error validating supervisor`);
        console.error(`Appointment does not have a supervisor listed`);
        await pg.pool.end();
        return;
      }
      const supervisorLocalRecord = await UcdlibEmployees.getById(supervisorEmployeeId, 'employeeId');
      if ( !supervisorLocalRecord.res.rowCount ) {
        await pg.pool.end();
        console.error(`Error validating supervisor`);
        console.error(`Appointment supervisor employee id ${supervisorEmployeeId} not found in local database`);
        return;
      }
      dataToWrite.supervisorId = supervisorLocalRecord.res.rows[0].iam_id;
    }

    // validate groups
    const groups = await iamAdmin.validateGroupList(employee.groups, false, force);
    if ( groups.error ) {
      console.error(`Error validating groups\n${groups.error.message}`);
      if ( groups.error.canForce ) console.error(forceMessage);
      await pg.pool.end();
      return;
    }

    // create record
    const createEmployee = await UcdlibEmployees.create(dataToWrite, employee.groups);
    if ( createEmployee.err ) {
      console.error(`Error creating employee record\n${createEmployee.err.message}`);
      await pg.pool.end();
      return;
    }
    const newEmployeeId = createEmployee.res[0].rows[0].id;

    console.log(`Created employee record with id ${newEmployeeId}`);
    await pg.pool.end();

  }

}

export default new employeesCli();
