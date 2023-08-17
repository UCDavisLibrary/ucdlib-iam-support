import UcdlibEmployees from "./employees.js";
import UcdlibOnboarding from "./onboarding.js";
import UcdlibSeparation from "./separation.js";
import UcdlibGroups from "./groups.js";
import UcdIamModel from "../models/UcdIamModel.js";
import IamPersonTransform from "./IamPersonTransform.js";
import keycloakClient from "./keycloakAdmin.js";
import PermissionsRequests from "./permissions.js"
import RequestsIsoUtils from "./requests-iso-utils.js";
import permissionsFormProperties from "./permissionsFormProperties.js";
import { UcdlibRt, UcdlibRtTicket } from "./rt.js";

/**
 * @classdesc Used to perform various admin operations for this application.
 */
class iamAdmin {
  constructor(){}

  async adoptEmployee(onboardingId, params={}){
    const forceAdoption = params.force || false;
    const ucdIamConfig = params.ucdIamConfig || {};

    const out = {
      error: false,
      message: ''
    }
    let dataToWrite = {};
    UcdIamModel.init(ucdIamConfig);

    // retrieve onboarding record
    if ( !onboardingId ) {
      out.error = true;
      out.message = 'onboardingId is required';
      out.canForce = false;
      return out;
    };
    let onboardingRecord = await UcdlibOnboarding.getById(onboardingId);
    if ( onboardingRecord.err ) {
      out.error = true;
      out.message = `Error retrieving onboarding record: ${onboardingRecord.err.message}`;
      out.canForce = false;
      return out;
    }
    if ( !onboardingRecord.res.rows.length ){
      out.error = true;
      out.message = `No onboarding record found for id ${onboardingId}`;
      out.canForce = false;
      return out;
    }
    onboardingRecord = onboardingRecord.res.rows[0];

    // retrieve ucd iam record
    const ids = {
      iamId: onboardingRecord.iam_id,
      email: onboardingRecord.additional_data.employeeEmail,
      userId: onboardingRecord.additional_data.employeeUserId,
      employeeId: onboardingRecord.additional_data.employeeId
    };
    let iamRecord = new IamPersonTransform({});
    let iamResponse = await UcdIamModel.getPerson(ids, true);
    if ( iamResponse.response.error ) {

      if ( UcdIamModel.noEmployeeFound(iamResponse.response) && !forceAdoption ) {
        out.error = true;
        out.message = `No employee found in IAM for onboarding record ${onboardingId}`;
        out.canForce = true;
        return out;
      }

      if ( !UcdIamModel.noEmployeeFound(iamResponse.response) && !forceAdoption ) {
        out.error = true;
        out.message = `Error interacting with IAM API: ${iamResponse.response.message}`;
        out.canForce = true;
        return out;
      }
    } else {
      iamRecord = new IamPersonTransform(iamResponse.response);
    }

    // extract and validate data from ucd iam record/onboarding record
    let basicEmployeeData = this.extractAndPopulateEmployeeFields({iamRecord, onboardingRecord, force: forceAdoption});
    if ( basicEmployeeData.error ) {
      return basicEmployeeData.error
    }
    dataToWrite = {...dataToWrite, ...basicEmployeeData.employeeData};

    // validate appointment
    let primaryAssociation = onboardingRecord.additional_data?.primaryAssociation || {};
    const appointments = await this.validateAppointments(iamRecord, primaryAssociation, forceAdoption);
    if ( appointments.error ) {
      return appointments.error;
    }
    dataToWrite.primaryAssociation = primaryAssociation;
    dataToWrite.ucdDeptCode = iamRecord.getPrimaryAssociation().deptCode;

    // validate supervisor
    if ( onboardingRecord.supervisor_id ) {
      const supervisor = await this.employeeRecordsExist(onboardingRecord.supervisor_id, forceAdoption);
      if ( supervisor.error ) {
        return supervisor.error;
      }
      if ( supervisor.iamRecord.employeeId != iamRecord.getSupervisorEmployeeId() ) {
        dataToWrite.customSupervisor = true;
      }
    } else {
      dataToWrite.customSupervisor = true;
    }

    // validate groups
    let groups = await this.validateGroupList(onboardingRecord.group_ids, onboardingRecord?.additional_data?.isDeptHead, forceAdoption);
    if ( groups.error ) {
      return groups.error;
    }
    groups = groups.groupRecords;

    // check if already employee
    let existingEmployee = false;
    const employeeRecord = await UcdlibEmployees.getByAnyId(dataToWrite);
    if ( employeeRecord.err ) {
      out.error = true;
      out.message = `Error retrieving employee record: ${employeeRecord.err.message}`;
      out.canForce = false;
      return out;
    }
    if ( employeeRecord.res.rows.length ) {
      existingEmployee = employeeRecord.res.rows[0].id;
      if ( !forceAdoption ) {
        out.error = true;
        out.message = 'Employee already exists';
        out.canForce = true;
        out.forceMessage = 'Force adoption will update the existing employee record.'
        return out;
      }
    }

    if ( existingEmployee ) {
      await UcdlibEmployees.removeAllGroupMemberships(existingEmployee);
      await UcdlibEmployees.delete(existingEmployee);
    }
    const groupArg = groups.map(g => {
      let isHead = onboardingRecord.additional_data?.isDeptHead && g.part_of_org;
      return {
        id: g.id,
        isHead
      }
    })
    const newEmployeeRecord = await UcdlibEmployees.create(dataToWrite, groupArg);
    if ( newEmployeeRecord.err ) {
      console.error(`Error creating employee record\n${createEmployee.err.message}`);
      await pg.pool.end();
      return;
    }
    const newEmployeeId = newEmployeeRecord.res[0].rows[0].id;
    out.employeeId = newEmployeeId;
    out.message = 'Employee record created';

    out.onboardingRecord = onboardingRecord;
    return out;
  }

  /**
   * @description Validates a list of group ids. If not valid, returns an error object
   * @param {Array} groups - Array of group ids or objects with the following properties:
   * {string|number} id - group id
   * {boolean} isHead - true if employee will be department head
   * @param {Boolean} willBeDeptHead - If passing in a list of group ids, set this to true if employee will be department head
   * @param {Boolean} force - Will not return error object if validation fails
   * @returns
   */
  async validateGroupList(groups, willBeDeptHead=false, force=false){
    const error = {error: true, message: '', canForce: false};
    const parsedGroups = [];
    for (const group of groups) {
      if ( typeof group === 'string' || typeof group === 'number' ) {
        parsedGroups.push({id: parseInt(group), isHead: false});
      } else if ( typeof group === 'object' ) {
        if ( !group.id ) {
          error.message = `Group object must have an id property`;
          error.canForce = false;
          return {error};
        }
        parsedGroups.push({id: parseInt(group.id), isHead: group.isHead || false});
      }
    }
    const groupIds = parsedGroups.map(g => g.id);
    let groupRecords = await UcdlibGroups.getById(groupIds, {returnHead: true});
    if ( groupRecords.err ) {
      error.message = `Error retrieving group records: ${groupRecords.err.message}`;
      error.canForce = false;
      return {error};
    }
    groupRecords = groupRecords.res.rows;

    if ( groupRecords.length != groupIds.length ) {
      error.message = `Not all groups found`;
      error.canForce = false;
      return {error};
    }

    // should have one and only one department
    const departments = groupRecords.filter(g => g.part_of_org);
    if ( departments.length > 1 && !force ) {
      error.message = `Multiple departments found in group list. Only one is allowed`;
      error.canForce = true;
      return {error};
    }
    if ( !departments.length && !force ) {
      error.message = `No department found in group list. At least one is required`;
      error.canForce = true;
      return {error};
    }

    // Check if group already has department head
    for (const group of groupRecords) {
      let isHead = parsedGroups.find(g => g.id == group.id).isHead;
      if ( group.part_of_org && willBeDeptHead ) isHead = true;
      if ( isHead && group.head.length ){
        error.message = `Group '${group.name}' already has a department head. Remove the current department head before adding this employee`;
        error.canForce = false;
        return {error};
      }
    }
    return {groupRecords};
  }

  /**
   * @description Checks if employee's appointments are valid. If not, returns an error object
   * @param {IamPersonTransform} iamRecord - UCD IAM record
   * @param {Object} primaryAssociation - Required if employee has multiple appointments. Object with the following properties:
   * {string} deptCode - department code
   * {string} titleCode - title code
   * @param {Boolean} force - Will not return error object if validation fails
   * @returns {Object} - {error: {error: boolean, message: string, canForce: boolean}, iamRecord: Object}
   */
  async validateAppointments(iamRecord, primaryAssociation={}, force=false){
    const error = {error: true, message: '', canForce: false};

    if ( !iamRecord.hasAppointment && !force ) {
      error.message = `No appointments found in IAM record`;
      error.canForce = true;
      return {error};
    }

    let hasPrimaryAssociation = primaryAssociation && Object.keys(primaryAssociation).length;
    if ( hasPrimaryAssociation ){
      if ( !primaryAssociation?.deptCode || !primaryAssociation?.titleCode ) {
        error.message = 'Primary association must have a deptCode and titleCode';
        error.canForce = false;
        return {error};
      }
      const association = iamRecord.getAssociation(primaryAssociation.deptCode, primaryAssociation.titleCode, true);
      if ( !Object.keys(association).length && !force) {
        error.message = `Primary association ${JSON.stringify(primaryAssociation)} not found in IAM record`;
        error.canForce = true;
        return {error};
      }
    }
    if ( !hasPrimaryAssociation && iamRecord.appointments.length > 1 && !force ) {
      error.message = `Multiple appointments found in IAM record, but no primary association provided`;
      error.canForce = true;
      return error;
    }

    return { iamRecord }

  }

  /**
   * @description Checks if an employee record exists in the local database and UCD IAM. If not, returns an error object
   * @param {String} iamId - employee IAM id
   * @param {Boolean} force - Will not return error object if record is missing
   * @returns {Object} - {error: {error: boolean, message: string, canForce: boolean}, iamRecord: Object, dbRecord: Object}
   */
  async employeeRecordsExist(iamId, force){
    const error = {error: true, message: '', canForce: false};
    const dbRecord = await UcdlibEmployees.getById(iamId, 'iamId');
    if ( dbRecord.err ) {
      error.message = `Error retrieving employee record from local db: ${dbRecord.err.message}`;
      error.canForce = false;
      return {error};
    }
    if ( !dbRecord.res.rows.length && !force ) {
      error.message = `No employee record found in local db for iam id '${iamId}'`;
      error.canForce = true;
      return {error};
    }
    let iamRecord = await UcdIamModel.getPersonByIamId(iamId);
    if ( iamRecord.error ) {
      if ( !UcdIamModel.noEmployeeFound(iamRecord) && !force ) {
        error.message = `Error interacting with IAM API: ${iamRecord.message}`;
        error.canForce = true;
        return {error};
      }
      if ( UcdIamModel.noEmployeeFound(iamRecord) && !force ) {
        error.message = `No record found in UCD IAM for iam id '${iamId}'`;
        error.canForce = true;
        return out;
      }
    }
    iamRecord = new IamPersonTransform(iamRecord);
    return { iamRecord, dbRecord };
  }

  /**
   * @description Gets employee data from UCD IAM record, onboarding record, or CLI input template
   * @param {Object} args - args object with the following properties:
   * {IamPersonTransform} iamRecord - UCD IAM record
   * {Object} onboardingRecord - onboarding record
   * {Object} templateRecord - CLI input template
   * {boolean} force - Will not return error object if a data field is missing
   *
   * @returns {Object} - {error: {error: boolean, message: string, canForce: boolean}, employeeData: Object
   */
  extractAndPopulateEmployeeFields(args) {
    let {iamRecord, onboardingRecord, templateRecord, force} = args;
    const iamId =  iamRecord?.id || templateRecord?.iam_id || onboardingRecord?.iam_id;
    const employeeId = iamRecord?.employeeId || templateRecord?.employee_id || onboardingRecord?.additional_data?.employeeId;
    const userId = iamRecord?.userId || templateRecord?.user_id || onboardingRecord?.additional_data?.employeeUserId;
    const email = iamRecord?.email || templateRecord?.email || onboardingRecord?.additional_data?.employeeEmail;
    const firstName = iamRecord?.firstName || templateRecord?.first_name || onboardingRecord?.additional_data?.employeeFirstName;
    const lastName = iamRecord?.lastName || templateRecord?.last_name || onboardingRecord?.additional_data?.employeeLastName;
    const middleName = iamRecord?.middleName || templateRecord?.middle_name;
    const suffix = iamRecord?.suffix || templateRecord?.suffix;
    const title = templateRecord?.title || onboardingRecord?.library_title;
    const supervisorId = templateRecord?.supervisor_id || onboardingRecord?.supervisor_id;
    const customSupervisor = templateRecord?.custom_supervisor || false;
    const types = iamRecord?.types || {};
    const fields = [
      {employeeTable: 'iamId', value: iamId, raise: true},
      {employeeTable: 'employeeId', value: employeeId, raise: true},
      {employeeTable: 'userId', value: userId, raise: true},
      {employeeTable: 'email', value: email, raise: true},
      {employeeTable: 'firstName', value: firstName, raise: true},
      {employeeTable: 'lastName', value: lastName, raise: true},
      {employeeTable: 'middleName', value: middleName},
      {employeeTable: 'suffix', value: suffix},
      {employeeTable: 'title', value: title, raise: true},
      {
        employeeTable: 'supervisorId',
        value: supervisorId,
        raise: customSupervisor ? true : false,
        msg: 'Either provide a supervisor id or set the custom supervisor flag to true'
      },
      {employeeTable: 'customSupervisor', value: customSupervisor, raise: false},
      {employeeTable: 'types', value: types, raise: false}
    ];

    const employeeData = {};
    for (const field of fields) {
      employeeData[field.employeeTable] = field.value;
      if ( !field.value && field.raise && !force ) {
        return {error: {error: true, message: `Missing value for '${field.employeeTable}' in records.${field.msg ? " " + field.msg : ""}`, canForce: true}};
      }
    }

    return {employeeData};
  }

  /**
   * @description Provision a new keycloak account, updates if already exists
   * @param {string} id - employee table id
   */
  async provisionKcAccount(id, params={}) {
    const out = {
      error: false,
      message: ''
    }

    if ( !id ){
      out.error = true;
      out.message = 'No employee id provided';
      return out;
    }

    if ( !params.keycloakConfig ){
      out.error = true;
      out.message = 'No keycloak config provided';
      return out;
    }

    const employeeRecord = await UcdlibEmployees.getById(id);
    if ( employeeRecord.err ) {
      out.error = true;
      out.message = `Error retrieving employee record: ${employeeRecord.err.message}`;
      return out;
    }
    if ( !employeeRecord.res.rows.length ) {
      out.error = true;
      out.message = 'No employee record found';
      return out;
    }
    const employee = employeeRecord.res.rows[0];
    if ( !employee.user_id ) {
      out.error = true;
      out.message = 'No user id found in employee record';
      return out;
    }

    keycloakClient.resetState();
    await keycloakClient.init({...params.keycloakConfig, refreshInterval: 58000});
    await keycloakClient.syncEmployee(employee.user_id, true);
    await keycloakClient.syncGroupMembershipByUser(employee.user_id);
    await keycloakClient.syncSupervisorsGroup(false);
    if ( params.printLogs) {
      keycloakClient.printLogs();
    }
    keycloakClient.resetState();
    return out;
  }

  /**
   * @description Delete an employee record and all associated group memberships
   * @param {string} id - employee table id
   */
  async deleteEmployee(id){
    const grouptxn = await UcdlibEmployees.removeAllGroupMemberships(id);
    if ( grouptxn.err ) {
      throw grouptxn.err;
    }
    const emptxn = await UcdlibEmployees.delete(id);
    if ( emptxn.err ) {
      throw emptxn.err;
    }
    return true;
  }

  async sendSeparationReminder(record, params={}) {
    const out = {log: {error: false, message: '', action: 'separation-reminder', actionTaken: false}};
    if ( record.additional_data?.separationReminderSent ) {
      out.log.message = 'Separation reminder already sent';
      return out;
    }
    let separationDate = record.separation_date;
    if ( !separationDate ) {
      out.log.message = 'No separation date found';
      return out;
    }
    let separationDay = separationDate.toISOString().split('T')[0];
    separationDate = new Date(`${separationDay}T00:00:00-07:00`);
    const now = new Date();
    if ( separationDate > now ) {
      out.log.message = 'Separation date is in the future';
      return out;
    }

    const rtConfig = params.rtConfig;
    const rtTicketId = record.rt_ticket_id;
    if ( !rtTicketId ) {
      out.log.message = 'No RT ticket id found';
      return out;
    }
    const rtClient = new UcdlibRt(rtConfig);
    const ticket = new UcdlibRtTicket(false, {id: rtTicketId});
    const reply = ticket.createReply();
    reply.addSubject('Reminder: Employee Separation Date');
    reply.addContent(`This is just a reminder that the separation date (${separationDay}) for this employee has passed.`);
    const rtResponse = await rtClient.sendCorrespondence(reply);
    if ( rtResponse.err )  {
      out.log.message = `Error sending separation reminder: ${rtResponse.err.message}`;
      out.log.error = true;
      return out;
    }

    const additionalData = {...(record.additional_data || {}), separationReminderSent: true};
    const update = await UcdlibSeparation.update(record.id, {additionalData});
    if ( update.err ) {
      out.log.message = `Error updating separation record: ${update.err.message}`;
      out.log.error = true;
      return out;
    }
    out.log.actionTaken = true;
    out.log.message = 'Separation reminder sent';

    return out;
  }

  /**
   * @description Check RT ticket status of an active separation record.
   * If the ticket is resolved, update the separation record status to resolving/resolved.
   * @param {*} record
   * @param {*} params
   * @returns
   */
  async resolveSeparationRecord(record, params={}) {
    const out = {log: {error: false, message: '', action: 'check-if-rt-is-resolved', actionTaken: false}};

    // return if ticket is not resolved
    let {log, lastStatusChange, isResolved} = await this.ticketIsResolved(record.rt_ticket_id, params.rtConfig);
    out.isResolved = isResolved ? true : false;
    if ( log.message ) {
      out.log = {...out.log, ...log};
      return out;
    }

    // status is resolving, check if it needs to be resolved
    if ( record.status_id === UcdlibSeparation.statusCodes.resolving ) {
      const threshold = params.rtConfig.daysSinceResolved || 3;
      const resolvedOn = new Date(lastStatusChange.res.Created);
      const intervalInDays = (Date.now() - resolvedOn.getTime()).toFixed(0) / 1000 / 60 / 60 / 24;
      if ( intervalInDays >= threshold ) {
        const setToResolved = await UcdlibSeparation.update(record.id, {statusId: UcdlibSeparation.statusCodes.resolved});
        if ( setToResolved.err ) {
          out.log.error = true;
          out.log.message = `Error updating separation record status: ${setToResolved.err.message}`;
          return out;
        }
        out.log.message = "Separation record status set to 'resolved'";
        out.log.actionTaken = true;

      } else {
        out.log.message = `Ticket is resolved but not yet ${threshold} days old. Not updating separation record status`;
        return out;
      }

    } else {
      const setToResolving = await UcdlibSeparation.update(record.id, {statusId: UcdlibSeparation.statusCodes.resolving});
      if ( setToResolving.err ) {
        out.log.error = true;
        out.log.message = `Error updating separation record status: ${setToResolving.err.message}`;
        return out;
      }
      out.log.message = "Separation record status set to 'resolving'";
      out.log.actionTaken = true;
    }

    return out;
  }

  /**
   * @description Check if an RT ticket is resolved
   * @param {String} ticketId
   * @param {Object} rtConfig
   * @returns {Object} - {log: {error: false, message: ''}, lastStatusChange: {err: null, res: null}}
   */
  async ticketIsResolved(ticketId, rtConfig){
    const out = {log: {error: false, message:''}};
    if ( !rtConfig ) {
      out.log.error = true;
      out.log.message = 'No rt config provided';
      return out;
    }
    const rtClient = new UcdlibRt(rtConfig);
    out.lastStatusChange = await rtClient.getLastStatusChange(ticketId);
    if ( out.lastStatusChange.err ) {
      out.log.error = true;
      out.log.message = `Error retrieving last status change: ${out.lastStatusChange.err.message}`;
    }
    if ( !out.lastStatusChange.res ) {
      out.log.message  = 'No last status change found';
      return out;
    }
    if ( out.lastStatusChange.res.NewValue !== 'resolved' ) {
      out.log.message = 'Ticket is not resolved. Not updating local record status';
      return out;
    } else {
      out.isResolved = true;
    }
    return out;
  }

  /**
   * @description Updates status of onboarding record to resolved or resolving if RT ticket is resolved
   * @param {String|Object} idOrRecord - onboarding record id or record object
   * @param {Object} params - params object with the following properties:
   * {Object} rtConfig - RT config object
   */
  async resolveOnboardingRecord(idOrRecord, params={}) {
    let out = {error: false, message: '', action: 'check-if-rt-is-resolved'};
    const rtConfig = params.rtConfig;
    const onboardingRecord = await this._getOnboardingRecord(idOrRecord);
    if ( onboardingRecord.error ) return onboardingRecord;
    out.onboardingRecordId = onboardingRecord.id;

    if ( !onboardingRecord.rt_ticket_id || onboardingRecord.rt_ticket_id.startsWith('fake-')) {
      out.message = 'No rt ticket id found';
      return out;
    }

    let {log, lastStatusChange} = await this.ticketIsResolved(onboardingRecord.rt_ticket_id, rtConfig);
    if ( log.message ) {
      out = {...out, ...log};
      return out;
    }

    // status is resolving, check if it needs to be resolved
    if ( onboardingRecord.status_id === UcdlibOnboarding.statusCodes.resolving ) {
      const threshold = params.rtConfig.daysSinceResolved || 3;
      const resolvedOn = new Date(lastStatusChange.res.Created);
      const intervalInDays = (Date.now() - resolvedOn.getTime()).toFixed(0) / 1000 / 60 / 60 / 24;
      if ( intervalInDays >= threshold ) {
        const setToResolved = await UcdlibOnboarding.update(onboardingRecord.id, {statusId: UcdlibOnboarding.statusCodes.resolved});
        if ( setToResolved.err ) {
          out.error = true;
          out.message = `Error updating onboarding record status: ${setToResolved.err.message}`;
          return out;
        }
        out.message = "Onboarding record status set to 'resolved'";
        out.actionTaken = true;

      } else {
        out.message = `Ticket is resolved but not yet ${threshold} days old. Not updating onboarding record status`;
        return out;
      }

    } else {
      const setToResolving = await UcdlibOnboarding.update(onboardingRecord.id, {statusId: UcdlibOnboarding.statusCodes.resolving});
      if ( setToResolving.err ) {
        out.error = true;
        out.message = `Error updating onboarding record status: ${setToResolving.err.message}`;
        return out;
      }
      out.message = "Onboarding record status set to 'resolving'";
      out.actionTaken = true;
    }

    return out;
  }

  async _getOnboardingRecord(idOrRecord) {
    const out = {error: false, message: ''};
    if ( !idOrRecord ) {
      out.error = true;
      out.message = 'No onboarding record id or record provided';
      return out;
    }
    let onboardingRecord;
    if ( typeof idOrRecord === 'string' ) {
      const record = await UcdlibOnboarding.getById(idOrRecord);
      if ( record.err ) {
        out.error = true;
        out.message = `Error retrieving onboarding record: ${record.err.message}`;
        return out;
      }
      if ( !record.res.rows.length ) {
        out.error = true;
        out.message = 'No onboarding record found';
        return out;
      }
      onboardingRecord = record.res.rows[0];
    } else {
      onboardingRecord = idOrRecord;
    }
    return onboardingRecord;
  }


  async checkOnboardingUcdIamRecord(idOrRecord, params={}) {
    const out = {
      error: false,
      message: '',
      action: 'check-if-iam-record-exists',
      actionTaken: false};
    if ( !params.ucdIamConfig ) {
      out.error = true;
      out.message = 'No ucd iam config provided';
      return out;
    }
    UcdIamModel.init(params.ucdIamConfig);
    const onboardingRecord = await this._getOnboardingRecord(idOrRecord);
    if ( onboardingRecord.error ) return onboardingRecord;
    out.onboardingRecordId = onboardingRecord.id;
    if ( onboardingRecord.iam_id && onboardingRecord.additional_data.employeeUserId ){
      out.message = 'Onboarding record already has an IAM record and employee user id';
      return out;
    }

    // retrieve ucd iam record
    const obUtils = new RequestsIsoUtils(onboardingRecord);
    if ( !obUtils.hasUniqueIdentifier() ) {
      out.message = 'Onboarding record does not have a unique identifier for the employee.';
      return out;
    }
    const ids = {
      iamId: onboardingRecord.iam_id,
      email: onboardingRecord.additional_data.employeeEmail,
      userId: onboardingRecord.additional_data.employeeUserId,
      employeeId: onboardingRecord.additional_data.employeeId
    };
    let iamResponse = await UcdIamModel.getPerson(ids, true);
    if ( iamResponse.response.error ) {

      if ( UcdIamModel.noEmployeeFound(iamResponse.response) ) {
        out.message = 'No IAM record found. Taking no action';
        return out;
      } else  {
        out.error = true;
        out.message = `Error interacting with IAM API: ${iamResponse.response.message}`;
        return out;
      }
    }
    const iamRecord = new IamPersonTransform(iamResponse.response);

    const additionalData = onboardingRecord.additional_data || {};
    const updatedFields = {
      iamId: {changed: onboardingRecord.iam_id !== iamRecord.id, value: iamRecord.id},
      userId: {changed: additionalData.employeeUserId !== iamRecord.userId, value: iamRecord.userId}
    }
    const data = {};
    if ( updatedFields.iamId.changed ) {
      data.iamId = updatedFields.iamId.value;
      data.statusId = 4;
    }
    if ( updatedFields.userId.changed ) {
      data.additionalData = {...additionalData, employeeUserId: updatedFields.userId.value};
      data.statusId = 5;

      if ( !onboardingRecord.skip_supervisor ) {
        let hasSupervisorResponse = await PermissionsRequests.getOnboardingPermissions(onboardingRecord.id);
        if ( hasSupervisorResponse.err ) {
          out.error = true;
          out.message = `Error checking for supervisor permissions request: ${hasSupervisorResponse.err.message}`;
          return out;
        }
        if ( !hasSupervisorResponse.res.rows.length ) {
          data.statusId = 2;
        }
      }
    }

    if ( !Object.keys(data).length ) {
      out.message = 'No need to update onboarding record. No UCD IAM fields have changed.';
      return out;
    }

    // save updated ucd iam record
    const ucdIamRecord = {
      dateRetrieved: (new Date()).toISOString(),
      record: iamRecord.data
    }
    if ( data.additionalData ) {
      data.additionalData.ucdIamRecord = ucdIamRecord;
    } else {
      data.additionalData = {...additionalData, ucdIamRecord};
    }

    // update onboarding record
    const updatedRecord = await UcdlibOnboarding.update(onboardingRecord.id, data);
    if ( updatedRecord.err ) {
      out.error = true;
      out.message = `Error updating onboarding record: ${updatedRecord.err.message}`;
      return out;
    }
    out.actionTaken = true;
    out.message = `Onboarding record updated: ${JSON.stringify(updatedFields)}`;
    out.rtSent = false;
    if (
      params.sendRt &&
      params.rtConfig &&
      !params.rtConfig.forbidWrite &&
      onboardingRecord.rt_ticket_id &&
      !onboardingRecord.rt_ticket_id.startsWith('fake-')){
      try {
        const rtClient = new UcdlibRt(params.rtConfig);
        const ticket = new UcdlibRtTicket(false, {id: onboardingRecord.rt_ticket_id});
        const reply = ticket.createReply();
        reply.addSubject('UC Davis IAM Record Updated');
        if ( updatedFields.iamId.changed ) {
          reply.addContent( `IAM record created with an id of ${updatedFields.iamId.value}`);
          if ( updatedFields.userId.changed ) {
            reply.addContent(`Employee computing user id set to ${updatedFields.userId.value}`);
          } else {
            reply.addContent(`Employee computing user id still not set`);
          }
        } else if ( updatedFields.userId.changed ) {
          reply.addContent(`Employee computing user id set to ${updatedFields.userId.value}`)
        }
        const rtResponse = await rtClient.sendCorrespondence(reply);
        if ( rtResponse.err )  {
          throw rtResponse.err;
        }
        out.rtSent = true;

      } catch (error) {
        out.rtError = error;
      }
    }


    return out;

  }

  /**
   * @description Update an employee record with the creation date set to now
   * @param {string} id - any employee unique identifer
   * @param {string} idType - the type of id provided
   */
  async updateEmployeeCreationDate(id, idType) {
    const out = {error: false, message: ''};
    if ( !id ) {
      out.error = true;
      out.message = 'No id provided';
      return out;
    }
    if ( !idType ) {
      out.error = true;
      out.message = 'No employee id type provided';
      return out;
    }
    const query = {};
    query[idType] = id;
    const employeeRecord = await UcdlibEmployees.getByAnyId(query);
    if ( employeeRecord.err ) {
      out.error = true;
      out.message = `Error retrieving employee record: ${employeeRecord.err.message}`;
      return out;
    }
    if ( !employeeRecord.res.rows.length ) {
      out.error = true;
      out.message = `No employee record found for ${idType} ${id}`;
      return out;
    }
    const employee = employeeRecord.res.rows[0];
    const update = await UcdlibEmployees.update(employee.id, {created: new Date()});
    if ( update.err ) {
      out.error = true;
      out.message = `Error updating employee record: ${update.err.message}`;
      return out;
    }
    out.message = 'Employee record updated';
    return out;
  }

  /**
   * @description Creates a facilitie RT ticket for an onboarding record, if it has not been created already
   * @param {*} idOrRecord
   * @param {*} params
   * @returns
   */
  async sendFacilitiesRtRequest(idOrRecord, params={}) {
    const out = {
      error: false,
      message: '',
      rtSent: false,
    }

    // fetch onboarding record
    let onboardingRecord;
    if ( typeof idOrRecord === 'string' ) {
      onboardingRecord = await UcdlibOnboarding.getById(idOrRecord);
      if ( onboardingRecord.err ) {
        console.log(onboardingRecord.err);
        out.error = true;
        out.message = `Error retrieving onboarding record: ${onboardingRecord.err.message}`;
        return out;
      }
      if ( !onboardingRecord.res.rows.length ) {
        out.error = true;
        out.message = 'No onboarding record found';
        return out;
      }
      onboardingRecord = onboardingRecord.res.rows[0];
    } else {
      onboardingRecord = idOrRecord;
    }
    if ( onboardingRecord.additional_data?.facilitiesRtTicketId ) {
      out.message = 'Onboarding record already has a facilities RT ticket id';
      return out;
    }

    // retrieve and check onboarding permissions record for data to send to facilities
    const permissionsRecord = await PermissionsRequests.getOnboardingPermissions(onboardingRecord.id);
    if ( permissionsRecord.err ) {
      out.error = true;
      console.log(permissionsRecord.err);
      out.message = `Error retrieving onboarding permissions record: ${permissionsRecord.err.message}`;
      return out;
    }
    if ( !permissionsRecord.res.rows.length ) {
      out.error = true;
      out.message = 'No onboarding permissions record found';
      return out;
    }
    const permissions = permissionsRecord.res.rows[0];
    const data = permissions.permissions?.facilities;
    const hasDetails = data?.details ? true : false;
    const hasAggieAccess = data?.aggieAccess ? true : false;
    let dataCt = 0;
    if ( data ) {
      const fields = permissionsFormProperties
        .filter(f => (f.payload || '').startsWith('permissions.facilities'))
        .filter(f => f.payload !== 'permissions.facilities.aggieAccess')
        .map(f => f.payload.split('.').pop());
      for (const field of fields) {
        if ( data[field] ) {
          dataCt++;
        }
      }
    }
    // aggie (card) access is facility access but handled by ITIS, so we don't need to send it to facilities dept
    if ( !dataCt || (dataCt === 1 && hasAggieAccess && hasDetails)) {
      out.message = 'No facilities data found in onboarding permissions record. Not sending RT request';
      return out;
    }

    // create RT ticket
    const config = params.rtConfig;
    const rtClient = new UcdlibRt(config);
    const ticket = new UcdlibRtTicket();
    const ad = onboardingRecord.additional_data || {};
    const subject = `New Employee Onboarding: ${ad.employeeFirstName || ''} ${ad.employeeLastName || ''}`;
    ticket.addSubject(subject);
    if ( config.user ) {
      ticket.addOwner(config.user);
    }
    const notifySupervisor = ad.supervisorEmail && !ad.skipSupervisor;
    if ( !config.forbidCc) {
      if ( notifySupervisor ) {
        ticket.addRequestor( ad.supervisorEmail );
      }
    }
    ticket.addOnboardingEmployeeInfo(onboardingRecord);
    await ticket.addOnboardingPositionInfo(onboardingRecord);
    const body = {};
    for (const p of permissionsFormProperties) {
      if ( !(p.payload || '').startsWith('permissions.facilities') ) continue;
      const field = p.payload.split('.').pop();
      if ( field === 'details' ) continue;
      if ( !p.label ) continue;
      body[p.label] = data[field] || p.default;
    }
    ticket.addContent(body);
    if ( data.details ) {
      ticket.addContent(`<h4>Request Details</h4>`);
      ticket.addContent(data.details, false);
    }

    ticket.addQueue(config.facilitiesQueue);
    const rtResponse = await rtClient.createTicket(ticket);
    if ( rtResponse.err || !rtResponse.res.id )  {
      console.log(rtResponse.err);
      out.error = true;
      out.message = `Error creating facitilies RT ticket`;
      return out;
    }
    const updateRes = await UcdlibOnboarding.update(onboardingRecord.id, {additionalData: {...ad, facilitiesRtTicketId: rtResponse.res.id}});
    if ( updateRes.err ) {
      console.log(updateRes.err);
      out.error = true;
      out.message = `Error updating onboarding record with RT ticket id`;
      return out;
    }
    out.rtSent = true;
    out.ticketId = rtResponse.res.id;
    out.message = `Facilities RT ticket created: ${rtResponse.res.id}`;
    return out;
  }

  /**
   * @description Sends a notification to the RT ticket that background check is complete
   * @param {String} rtTicketId - RT ticket id
   * @param {Object} data - data object saved to additional_data field of onboarding record
   * @param {Object} params - params object with the following properties:
   * {Object} rtConfig - RT config object
   * {Object} onboardingRecord - onboarding record object
   * {String} submittedBy - username of person who submitted the background check request
   * @returns {Object}
   */
  async sendBackgroundCheckRtNotification(rtTicketId, data={}, params={}) {
    const out = {
      error: false,
      message: '',
      rtSent: false,
    }
    const rtClient = new UcdlibRt(params.rtConfig);
    const ticket = new UcdlibRtTicket(false, {id: rtTicketId});
    let name = '';
    if ( params.onboardingRecord?.additional_data ) {
      name = `${params.onboardingRecord.additional_data.employeeFirstName || ''} ${params.onboardingRecord.additional_data.employeeLastName || ''}`;
    }
    let reply = ticket.createReply();
    reply.addSubject('Background Check Completed');
    reply.addContent('Hello,');
    reply.addContent('');
    reply.addContent(`The background check ${name ? `for ${name} ` : ''}has been completed.`);
    if ( data.message ) {
      reply.addContent('');
      reply.addContent('Details:');
      reply.addContent(data.message);
    }
    if ( params.submittedBy ){
      reply.addContent('');
      reply.addContent(`Submitted by: ${params.submittedBy}`);
    }
    const rtResponse = await rtClient.sendCorrespondence(reply);
    if ( rtResponse.err )  {
      out.error = true;
      out.response = rtResponse.err;
      return out;
    }
    out.rtSent = true;
    out.message = `Background check RT notification sent`;
    return out;

  }
}

export default new iamAdmin();
