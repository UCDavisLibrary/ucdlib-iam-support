import UcdlibEmployees from "./employees.js";
import UcdlibOnboarding from "./onboarding.js";
import UcdlibGroups from "./groups.js";
import UcdIamModel from "../models/UcdIamModel.js";
import IamPersonTransform from "./IamPersonTransform.js";
import keycloakClient from "./keycloakAdmin.js";
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
    const dataToWrite = {};
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

    // extract and validate data from ucd iam record
    const fields = [
      {employeeTable: 'iamId', value: iamRecord.id || onboardingRecord.iam_id, raise: true},
      {employeeTable: 'employeeId', value: iamRecord.employeeId || onboardingRecord.additional_data.employeeId, raise: true},
      {employeeTable: 'userId', value: iamRecord.userId || onboardingRecord.additional_data.employeeUserId, raise: true},
      {employeeTable: 'email', value: iamRecord.email || onboardingRecord.additional_data.employeeEmail, raise: true},
      {employeeTable: 'firstName', value: iamRecord.firstName || onboardingRecord.additional_data.employeeFirstName, raise: true},
      {employeeTable: 'lastName', value: iamRecord.lastName || onboardingRecord.additional_data.employeeLastName, raise: true},
      {employeeTable: 'middleName', value: iamRecord.middleName},
      {employeeTable: 'suffix', value: iamRecord.suffix},
      {employeeTable: 'title', value: onboardingRecord.library_title, raise: true},
      {employeeTable: 'supervisorId', value: onboardingRecord.supervisor_id, raise: true},
      {employeeTable: 'types', value: iamRecord.types}
    ];
    for (const field of fields) {
      dataToWrite[field.employeeTable] = field.value;
      if ( !field.value && field.raise && !forceAdoption ) {
        out.error = true;
        out.message = `Missing value for '${field.employeeTable}' in IAM record`;
        out.canForce = true;
        return out;
      }
    }
    
    // validate appointment
    let primaryAssociation = onboardingRecord.additional_data.primaryAssociation;
    let hasPrimaryAssociation = primaryAssociation && Object.keys(primaryAssociation).length;
    if ( hasPrimaryAssociation ){
      const association = iamRecord.getAssociation(primaryAssociation.deptCode, primaryAssociation.titleCode, true);
      if ( !Object.keys(association).length && !forceAdoption) {
        out.error = true;
        out.message = `Primary association ${JSON.stringify(primaryAssociation)} not found in IAM record`;
        out.canForce = true;
        return out;
      }
    }
    if ( !iamRecord.hasAppointment && !forceAdoption ) {
      out.error = true;
      out.message = `No appointment found in IAM record`;
      out.canForce = true;
      return out;
    }
    if ( !hasPrimaryAssociation && iamRecord.appointments.length > 1 && !forceAdoption ) {
      out.error = true;
      out.message = `Multiple appointments found in IAM record, but no primary association provided`;
      out.canForce = true;
      return out;
    }
    dataToWrite.primaryAssociation = primaryAssociation;
    dataToWrite.ucdDeptCode = iamRecord.primaryAssociation.deptCode;

    // validate supervisor
    if ( onboardingRecord.supervisor_id ) {
      const supervisor = await UcdlibEmployees.getById(onboardingRecord.supervisor_id, 'iamId');
      if ( supervisor.err ) {
        out.error = true;
        out.message = `Error retrieving supervisor record: ${supervisor.err.message}`;
        out.canForce = false;
        return out;
      }
      if ( !supervisor.res.rows.length && !forceAdoption ) {
        out.error = true;
        out.message = `No supervisor record found for iam id '${onboardingRecord.supervisor_id}'`;
        out.canForce = true;
        return out;
      }
      let supervisorIamRecord = await UcdIamModel.getPersonByIamId(onboardingRecord.supervisor_id);
      if ( supervisorIamRecord.error ) {
        if ( !UcdIamModel.noEmployeeFound(supervisorIamRecord) && !forceAdoption ) {
          out.error = true;
          out.message = `Error interacting with IAM API: ${supervisorIamRecord.message}`;
          out.canForce = true;
          return out;
        }
        if ( UcdIamModel.noEmployeeFound(supervisorIamRecord) && !forceAdoption ) {
          out.error = true;
          out.message = `No supervisor found in IAM for iam id '${onboardingRecord.supervisor_id}'`;
          out.canForce = true;
          return out;
        }
      }
      supervisorIamRecord = new IamPersonTransform(supervisorIamRecord);
      if ( supervisorIamRecord.employeeId != iamRecord.supervisorEmployeeId ) {
        dataToWrite.customSupervisor = true;
      }
    } else {
      dataToWrite.customSupervisor = true;
    }

    // validate groups
    const groups = await UcdlibGroups.getById(onboardingRecord.group_ids);
    if ( groups.err ) {
      out.error = true;
      out.message = `Error retrieving group records: ${groups.err.message}`;
      out.canForce = false;
      return out;
    }
    const groupById = {};
    for (const group of groups.res.rows) {
      groupById[group.id] = group;
    }
    let orgGroupCount = 0;
    let orgGroup = {};
    for (const groupId of onboardingRecord.group_ids) {
      if ( !groupById[groupId] && !forceAdoption ) {
        out.error = true;
        out.message = `No group record found for id '${groupId}'`;
        out.canForce = true;
        return out;
      }
      if ( groupById[groupId].part_of_org ) {
        orgGroupCount++;
        orgGroup = groupById[groupId];
      }
    }
    if ( orgGroupCount > 1 && !forceAdoption ) {
      out.error = true;
      out.message = `Multiple departments found in group list of onboarding record. Only one is allowed`;
      out.canForce = true;
      return out;
    }
    if ( !orgGroupCount && !forceAdoption ) {
      out.error = true;
      out.message = `No department found in group list of onboarding record. At least one is required`;
      out.canForce = true;
      return out;
    }
    if ( onboardingRecord.additional_data.isDeptHead ) {
      const currentHead = await UcdlibGroups.getGroupHead(orgGroup.id);
      if ( currentHead.err ) {
        out.error = true;
        out.message = `Error retrieving current department head: ${currentHead.err.message}`;
        out.canForce = false;
        return out;
      }
      if ( currentHead.res.rows.length && !forceAdoption ) {
        out.error = true;
        out.message = `Department head already exists for department '${orgGroup.name}'`;
        out.canForce = true;
        out.forceMessage = 'Force adoption will replace the current department head.'
        return out;
      }
    }

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
    const newEmployeeRecord = await UcdlibEmployees.create(dataToWrite);
    if ( newEmployeeRecord.err ) {
      out.error = true;
      out.message = `Error creating employee record: ${newEmployeeRecord.err.message}`;
      out.canForce = false;
      return out;
    }
    const newEmployeeId = newEmployeeRecord.res.rows[0].id;
    out.employeeId = newEmployeeId;
    out.message = 'Employee record created';

    if ( onboardingRecord.additional_data.isDeptHead ) {
      let removeCurrentHead = await UcdlibGroups.removeGroupHead(orgGroup.id);
      if ( removeCurrentHead.err ) {
        await UcdlibEmployees.delete(newEmployeeId);
        out.error = true;
        out.message = `Error removing current department head: ${removeCurrentHead.err.message}`;
        out.canForce = false;
        return out;
      }
    }
    const addedGroups = [];
    for (const groupId of onboardingRecord.group_ids) {
      let isHead = onboardingRecord.additional_data.isDeptHead && groupId == orgGroup.id;
      let addGroupMembership = await UcdlibEmployees.addEmployeeToGroup(newEmployeeId, groupId, isHead);
      if ( addGroupMembership.err ) {
        await UcdlibEmployees.delete(newEmployeeId);
        for (const addedGroup of addedGroups) {
          await UcdlibEmployees.removeEmployeeFromGroup(newEmployeeId, addedGroup);
        }
        out.error = true;
        out.message = `Error adding employee to group '${groupId}': ${addGroupMembership.err.message}`;
        out.canForce = false;
        return out;
      }
      addedGroups.push(groupId);
    }

    out.onboardingRecord = onboardingRecord;
    return out;
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

  /**
   * @description Updates status of onboarding record to resolved or resolving if RT ticket is resolved
   * @param {String|Object} idOrRecord - onboarding record id or record object
   * @param {Object} params - params object with the following properties:
   * {Object} rtConfig - RT config object
   */
  async resolveOnboardingRecord(idOrRecord, params={}) {
    const out = {error: false, message: '', action: 'check-if-rt-is-resolved'};
    const rtConfig = params.rtConfig;
    if ( !rtConfig ) {
      out.error = true;
      out.message = 'No rt config provided';
      return out;
    }
    const onboardingRecord = await this._getOnboardingRecord(idOrRecord);
    if ( onboardingRecord.error ) return onboardingRecord;
    out.onboardingRecordId = onboardingRecord.id;

    if ( !onboardingRecord.rt_ticket_id || onboardingRecord.rt_ticket_id.startsWith('fake-')) {
      out.message = 'No rt ticket id found';
      return out;
    }

    const rtClient = new UcdlibRt(params.rtConfig);
    const lastStatusChange = await rtClient.getLastStatusChange(onboardingRecord.rt_ticket_id);
    if ( lastStatusChange.err ) {
      out.error = true;
      out.message = `Error retrieving last status change: ${lastStatusChange.err.message}`;
    }
    if ( !lastStatusChange.res ) {
      out.message  = 'No last status change found';
      return out;
    }
    if ( lastStatusChange.res.NewValue !== 'resolved' ) {
      out.message = 'Ticket is not resolved. Not updating onboarding record status';
      return out;
    }
    if ( onboardingRecord.status_id === 6 ) {
      const threshold = params.rtConfig.daysSinceResolved || 3;
      const resolvedOn = new Date(lastStatusChange.res.Created);
      const intervalInDays = (Date.now() - resolvedOn.getTime()).toFixed(0) / 1000 / 60 / 60 / 24;
      if ( intervalInDays >= threshold ) {
        const setToResolved = await UcdlibOnboarding.update(onboardingRecord.id, {statusId: 7});
        if ( setToResolved.err ) {
          out.error = true;
          out.message = `Error updating onboarding record status: ${setToResolved.err.message}`;
          return out;
        }
        out.message = "Onboarding record status set to 'resolved'";

      } else {
        out.message = `Ticket is resolved but not yet ${threshold} days old. Not updating onboarding record status`;
        return out;
      }
      console.log(intervalInDays);

    } else {
      const setToResolving = await UcdlibOnboarding.update(onboardingRecord.id, {statusId: 6});
      if ( setToResolving.err ) {
        out.error = true;
        out.message = `Error updating onboarding record status: ${setToResolving.err.message}`;
        return out;
      }
      out.message = "Onboarding record status set to 'resolving'";
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
    const out = {error: false, message: '', action: 'check-if-iam-record-exists'};
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

    const additionalData = onboardingRecord.additional_data;
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
    }

    // check if still awaiting supervisor response, and override status

    // update onboarding record

    // if rt, write comment
  

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
}

export default new iamAdmin();