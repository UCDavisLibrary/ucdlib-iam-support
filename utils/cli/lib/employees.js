import config from './cli-config.js';
import utils from './utils.js';
import iamAdmin from '@ucd-lib/iam-support-lib/src/utils/admin.js';
import UcdlibEmployees from '@ucd-lib/iam-support-lib/src/utils/employees.js';
import pg from '@ucd-lib/iam-support-lib/src/utils/pg.js';
import { UcdlibRt, UcdlibRtTicket } from '@ucd-lib/iam-support-lib/src/utils/rt.js';



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
    let r;
    if ( name ) {
      r = await UcdlibEmployees.searchByName(name);
    }

    if ( !r || r.err ) {
      console.error(`Error searching for employees\n${r ? r.err.message : ''}`);
      await pg.client.end();
      return;
    }
    utils.logObject(r.res.rows);
    await pg.client.end();
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

}

export default new employeesCli();
