import RequestsIsoUtils from '@ucd-lib/iam-support-lib/src/utils/requests-iso-utils.js';
import UcdlibOnboarding from '@ucd-lib/iam-support-lib/src/utils/onboarding.js';
import UcdlibGroups from '@ucd-lib/iam-support-lib/src/utils/groups.js';
import PermissionsRequests from '@ucd-lib/iam-support-lib/src/utils/permissions.js';
import config from '../lib/config.js';
import { UcdlibRt, UcdlibRtTicket } from '@ucd-lib/iam-support-lib/src/utils/rt.js';
import UcdlibEmployees from '@ucd-lib/iam-support-lib/src/utils/employees.js';
import TextUtils from '@ucd-lib/iam-support-lib/src/utils/text.js';
import getByName from '@ucd-lib/iam-support-lib/src/utils/getByName.js';
import Pg from '@ucd-lib/iam-support-lib/src/utils/pg.js';
import iamAdmin from '@ucd-lib/iam-support-lib/src/utils/admin.js';
import {UcdIamModel} from '@ucd-lib/iam-support-lib/index.js';

UcdIamModel.init(config.ucdIamApi);

export default (api) => {

  /**
   * @description Create a new onboarding request
   */
  api.post('/onboarding/new', async (req, res) => {
    if ( !req.auth.token.canCreateRequests ){
      res.status(403).json({
        error: true,
        message: 'Not authorized to access this resource.'
      });
      return;
    }

    const payload = req.body;
    if ( !payload.additionalData ) payload.additionalData = {};

    payload.submittedBy = req.auth.token.id;
    payload.modifiedBy = req.auth.token.id;

    // get ucd iam record
    if ( payload.iamId ){
      const iamResponse = await UcdIamModel.getPersonByIamId(payload.iamId);
      if ( !iamResponse.error ){
        payload.additionalData.ucdIamRecord = {
          dateRetrieved: (new Date()).toISOString(),
          record: iamResponse
        }
      }
    }

    // special handling for an intra-library transfer
    const transfer = {
      isTransfer: payload?.additionalData?.isTransfer ? true : false
    };
    if ( transfer.isTransfer ) {

      // check for local employee record
      const options = {returnSupervisor: true, returnGroups: true};
      const employeeRecord = await UcdlibEmployees.getById(payload.iamId, 'iamId', options);
      if ( employeeRecord.err ) {
        console.error(employeeRecord.err);
        res.status(500).json({error: true, message: 'Unable to retrieve employee record'});
        return;
      }
      if ( !employeeRecord.res.rowCount ) {
        res.status(400).json({error: true, message: 'Employee record not found'});
        return;
      }
      transfer.employeeRecord = employeeRecord.res.rows[0];
      transfer.departmentName = transfer.employeeRecord.groups.find(g => g.partOfOrg)?.name || '';

      // if supervisor is missing, carry over from previous position
      if ( !payload.supervisorId && transfer.employeeRecord.supervisor.iamId ){
        payload.supervisorId = transfer.employeeRecord.supervisor.iamId;
        payload.additionalData.supervisorEmail = transfer.employeeRecord.supervisor.email;
        payload.additionalData.supervisorFirstName = transfer.employeeRecord.supervisor.firstName;
        payload.additionalData.supervisorLastName = transfer.employeeRecord.supervisor.lastName;
      }

      // add previous position to additionalData
      if ( !payload.additionalData ) payload.additionalData = {};
      payload.additionalData.previousPosition = {
        title: transfer.employeeRecord.title,
        groups: transfer.employeeRecord.groups,
        supervisor: transfer.employeeRecord.supervisor
      };
    }

    const r = await UcdlibOnboarding.create(payload);
    if ( r.err ) {
      console.error(r.err);
      return res.status(500).json({error: true, message: 'Unable to create onboarding request.'});
    }
    const output = r.res.rows[0];

    // needed variables for RT ticket
    const ad = payload.additionalData || {};
    const notifySupervisor = ad.supervisorEmail && !ad.skipSupervisor;
    const notifyEmployee = ad.contactEmployee && ad.employeeContactEmail;
    let department =  await UcdlibGroups.getDepartmentsById(payload.groupIds || []);
    department = department.res && department.res.rows.length ? department.res.rows[0].name : '';
    const employeeName = `${ad.employeeLastName}, ${ad.employeeFirstName}`;

    // create rt ticket
    const rtClient = new UcdlibRt(config.rt);
    const ticket = new UcdlibRtTicket();

    ticket.addSubject(`Onboarding: ${employeeName}`);
    if ( config.rt.user ){
      ticket.addOwner(config.rt.user);
    }

    if ( !config.rt.forbidCc) {
      if ( notifySupervisor ) {
        ticket.addRequestor( ad.supervisorEmail );
        if ( transfer.isTransfer ) {
          const e = transfer.employeeRecord.supervisor.email;
          if ( e && e != ad.supervisorEmail ) ticket.addCc( e );
        }
      }
      if ( notifyEmployee ) {
        ticket.addCc( ad.employeeContactEmail );
      }
    } else {
      if ( notifySupervisor ){
        console.log(`Not adding supervisor email to RT ticket CC: ${ad.supervisorEmail}`);
      }
      if ( notifyEmployee ){
        console.log(`Not adding employee email to RT ticket CC: ${ad.employeeContactEmail}`);
      }
    }

    // ticket content
    ticket.addContent();
    ticket.addOnboardingEmployeeInfo(payload);
    await ticket.addOnboardingPositionInfo(payload);
    if ( payload.notes ){
      ticket.addContent(`<h4>Notes</h4>`);
      ticket.addContent(payload.notes, false);
    }
    if ( transfer.isTransfer ) {
      ticket.addContent('');
      ticket.addContent(`<h4>Previous Position</h4>`);
      ticket.addContent({
        'Title': transfer.employeeRecord.title || '',
        'Department': transfer.departmentName || '',
        'Supervisor': `${transfer.employeeRecord.supervisor.firstName || ''} ${transfer.employeeRecord.supervisor.lastName || ''}`
      }, false);
    }
    ticket.addContent('');
    ticket.addContent(`<a href='${config.baseUrl}/onboarding/${output.id}'>View entire onboarding record.</a>`)

    // send ticket to RT for creation
    const rtResponse = await rtClient.createTicket(ticket);
    if ( rtResponse.err || !rtResponse.res.id )  {
      console.error(rtResponse);
      await UcdlibOnboarding.delete(output.id);
      return res.status(500).json({error: true, message: 'Unable to create an RT ticket for this request.'});
    }

    // send correspondence to supervisor
    if ( notifySupervisor ){
      const obUtils = new RequestsIsoUtils(payload);
      const supervisorName = ad.supervisorFirstName && ad.supervisorLastName ? `${ad.supervisorFirstName} ${ad.supervisorLastName}` : 'Supervisor';
      const supervisorLink = `${config.baseUrl}/permissions/onboarding/${output.id}`;
      const onboardingLink = `${config.baseUrl}/onboarding/${output.id}`;
      const reply = ticket.createReply();
      reply.addSubject(`${transfer.isTransfer ? 'New ' : ''}Supervisor Action Required!`);
      reply.addContent(`Hi ${supervisorName},`);
      reply.addContent('');
      reply.addContent(`To proceed with your employee's onboarding, please describe the accounts and permissions required to perform their essential job duties using the following form:`);
      reply.addContent('');
      reply.addContent(`<a href='${supervisorLink}'>${supervisorLink}</a>`);
      if ( !obUtils.hasUniqueIdentifier() ){
        reply.addContent('');
        reply.addContent('<b>IMPORTANT:</b> The employee is currently missing a record in UC Path, and most account provisioning requires this record to exist.' );
        reply.addContent("While you may fill out the above form now, the employee will not be able to access most accounts until their record is created in UC Path and merged with the Library's record.");
        reply.addContent(`To merge records, go to <a href='${onboardingLink}'>${onboardingLink}</a> and click the "Reconcile Manually" button in the "Status" box when their UC Path record has been created.`);
      }
      if ( transfer.isTransfer ) {
        reply.addContent('');
        reply.addContent('');
        reply.addContent("Since this is an intra-library transfer, if any special existing permissions need to be removed, the former supervisor should just reply to this ticket.");
      }
      const replyResponse = await rtClient.sendCorrespondence(reply);
      if ( replyResponse.err )  {
        console.error(replyResponse);
        await UcdlibOnboarding.delete(output.id);
        return res.status(500).json({error: true, message: 'Unable to send RT request to supervisor.'});
      }
    }

    await UcdlibOnboarding.update(output.id, {rtTicketId: rtResponse.res.id});
    return res.json(output);

  });

  /**
   * @description Reconcile an onboarding request with a UC Davis IAM record
   * Used if a manual submission does not have a unique identifier
   * Someone must come back later and match the records
   */
  api.post('/onboarding/reconcile', async (req, res) => {

    // make sure request is formatted correctly
    const payload = req.body;
    const ids = ['onboardingId', 'iamId'];
    for ( const id of ids ) {
      if ( !payload[id] ) {
        res.status(400).json({
          error: true,
          message: `Missing required field: ${id}`
        });
        return;
      }
    }

    // make sure onboarding record exists and user has access
    let onboardingRecord = await UcdlibOnboarding.getById(payload.onboardingId);
    if ( onboardingRecord.err ) {
      console.error(onboardingRecord.err);
      res.status(400).json({error: true, message: 'Unable to retrieve onboarding request'});
      return;
    }
    if ( !onboardingRecord.res.rows.length ){
      console.error(onboardingRecord.err);
      res.status(400).json({error: true, message: 'Request does not exist!'});
      return;
    }
    onboardingRecord = TextUtils.camelCaseObject(onboardingRecord.res.rows[0]);
    if (
      !req.auth.token.hasAdminAccess &&
      !req.auth.token.hasHrAccess &&
      req.auth.token.iamId != onboardingRecord.supervisorId ){
      res.status(403).json({
        error: true,
        message: 'Not authorized to access this resource.'
      });
      return;
    }

    // make sure iam record exists
    UcdIamModel.init(config.ucdIamApi);
    const iamResponse = await UcdIamModel.getPersonByIamId(payload.iamId);
    if ( iamResponse.error ) {
      if ( UcdIamModel.noEmployeeFound ){
        res.status(400).json({
          error: true,
          message: 'No employee found with this IAM ID'
        });
        return;
      } else {
        console.error(iamResponse.error);
        res.status(502).json({
          error: true,
          message: 'Unable to retrieve employee record from UCD IAM API.'
        });
        return;
      }
    }
    const iamRecord = new IamPersonTransform(iamResponse);

    // send RT correspondence
    if ( onboardingRecord.rtTicketId ) {
      const rtClient = new UcdlibRt(config.rt);
      const ticket = new UcdlibRtTicket(false, {id: onboardingRecord.rtTicketId});
      let reply = ticket.createReply();
      reply.addSubject(`Onboarding Record Reconciled with UC Davis IAM System`);
      const d = {
        'Name': iamRecord.fullName,
        'Email': iamRecord.email,
        'Employee Id': iamRecord.employeeId,
        'User Id (kerberos)': iamRecord.userId,
        'UCD IAM ID': iamRecord.id
      }
      reply.addContent(d);
      const rtResponse = await rtClient.sendCorrespondence(reply);
      if ( rtResponse.err )  {
        console.error(rtResponse);
        res.status(502).json({error: true, message: 'Unable to send RT correspondence.'});
        return;
      }
    }

    // update onboarding record
    const data = {
      iamId: payload.iamId,
      modifiedBy: req.auth.token.id,
      additionalData: onboardingRecord.additionalData || {},
      statusId: UcdlibOnboarding.statusCodes.supervisor
    };
    data.additionalData.employeeId = iamRecord.employeeId;
    data.additionalData.employeeEmail = iamRecord.email;
    data.additionalData.employeeUserId = iamRecord.userId;
    data.additionalData.ucdIamRecord = {
      dateRetrieved: (new Date()).toISOString(),
      record: iamRecord.data
    }
    if ( !iamRecord.userId ) {
      data.statusId = UcdlibOnboarding.statusCodes.userId;
    } else if ( onboardingRecord.skipSupervisor || !onboardingRecord.supervisorId ) {
      data.statusId = UcdlibOnboarding.statusCodes.provisioning;
    } else {
      const permRequest = await PermissionsRequests.getOnboardingPermissions(onboardingRecord.id);
      if ( permRequest.err ) {
        console.error(permRequest.err);
        res.status(502).json({
          error: true,
          message: 'Unable to retrieve permissions request.'
        });
        return;
      }
      if ( permRequest.res.rowCount ) {
        data.statusId = UcdlibOnboarding.statusCodes.provisioning;
      }
    }
    const update = await UcdlibOnboarding.update(onboardingRecord.id, data);
    if ( update.err ) {
      console.error(update.err);
      res.status(500).json({
        error: true,
        message: 'Unable to update onboarding request.'
      });
      return;
    }
    return res.json({success: true});
  });

  /**
   * @description Search for a previously-submitted onboarding request, with the following url query params:
   * firstName - first name of employee
   * lastName - last name of employee
   */
  api.get('/onboarding/search', async (req, res) => {
    if (
      !req.auth.token.hasAdminAccess &&
      !req.auth.token.hasHrAccess ){
      res.status(403).json({
        error: true,
        message: 'Not authorized to access this resource.'
      });
      return;
    }

    if ( !req.query.firstName && !req.query.lastName ) {
      res.status(400).json({
        error: true,
        message: 'Missing required query parameters: firstName, lastName'
      });
      return;
    }

    const r = await getByName.getByName("onboarding",req.query.firstName, req.query.lastName);
    if ( r.err ) {
      console.error(r.err);
      return res.status(500).json({error: true, message: 'Unable to retrieve SEARCH onboarding request'});
    }
    if ( !r.res.rows.length ){
      res.status(404).json({error: true, message: 'No requests match your search.'});
      return;
    }

    return res.json(r.res.rows);

  });

  /**
   * @description Get a single onboarding request by id
   */
  api.get('/onboarding/:id', async (req, res) => {

    const r = await UcdlibOnboarding.getById(req.params.id);
    if ( r.err ) {
      console.error(r.err);
      return res.status(500).json({error: true, message: 'Unable to retrieve onboarding request'});
    }
    if ( !r.res.rows.length ){
      console.error(r.err);
      res.json({error: true, message: 'Request does not exist!'});
      return;
    }
    const obReq = TextUtils.camelCaseObject(r.res.rows[0]);
    if (
      !req.auth.token.hasAdminAccess &&
      !req.auth.token.hasHrAccess &&
      req.auth.token.iamId != obReq.supervisorId ){
      res.status(403).json({
        error: true,
        message: 'Not authorized to access this resource.'
      });
      return;
    }

    // Get department name
    let groups = await UcdlibGroups.getAll();
    if ( groups.err ){
      console.error(groups.err);
      return res.status(500).json({error: true, message: errorMsg});
    }
    groups = Pg.recordsById(groups.res.rows);
    obReq.departmentName = '';
    obReq.groupIds.forEach(gid => {
      if ( groups[gid] && groups[gid].part_of_org ){
        obReq.departmentName = groups[gid].name;
      }
    });
    return res.json(obReq);

  });

  /**
   * @description Sends a notice that employee completed background check to specified RT ticket
   * Payload looks for sendItisRt and sendFacilitiesRt booleans
   * Will not send if background check notification has already been sent
   */
    api.post('/onboarding/:id/background-check-notification', async (req, res) => {

      if (
        !req.auth.token.hasAdminAccess &&
        !req.auth.token.hasHrAccess ){
        res.status(403).json({
          error: true,
          message: 'Not authorized to perform this action.'
        });
        return;
      }

      const obReq = await UcdlibOnboarding.getById(req.params.id);
      if ( obReq.err ) {
        console.error(obReq.err);
        res.status(500).json({error: true, message: 'Unable to retrieve onboarding request'});
        return;
      }
      if ( !obReq.res.rowCount ){
        res.status(404).json({error: true, message: 'Onboarding request does not exist!'});
        return;
      }
      const onboardingRecord = obReq.res.rows[0];
      const backgroundCheck = onboardingRecord.additional_data?.backgroundCheck || {};

      if ( backgroundCheck.notificationSent ) {
        res.status(400).json({error: true, message: 'Background check notification already sent!'});
        return;
      }

      const payload = req.body;
      if ( !payload.sendItisRt && !payload.sendFacilitiesRt ) {
        res.status(400).json({error: true, message: 'Missing required field: sendItisRt or sendFacilitiesRt'});
        return;
      }
      const params = {rtConfig: config.rt, submittedBy: req.auth.token.id, onboardingRecord}
      if ( payload.sendItisRt ) {
        const ticketId = onboardingRecord.rt_ticket_id;
        if ( !ticketId ) {
          res.status(400).json({error: true, message: 'No ITIS RT ticket ID found!'});
          return;
        }
        const r = await iamAdmin.sendBackgroundCheckRtNotification(ticketId, payload, params);
        if ( r.error ) {
          console.error(r);
          res.status(500).json({error: true, message: 'Unable to send ITIS RT notification'});
          return;
        }
        backgroundCheck.itisRtSent = true;
        backgroundCheck.itisRtSentTimestamp = new Date().toISOString();
      }
      if ( payload.sendFacilitiesRt ) {
        const ticketId = onboardingRecord.additional_data?.facilitiesRtTicketId;
        if ( !ticketId ) {
          res.status(400).json({error: true, message: 'No Facilities RT ticket ID found!'});
          return;
        }
        const r = await iamAdmin.sendBackgroundCheckRtNotification(ticketId, payload, params);
        if ( r.error ) {
          console.error(r);
          res.status(500).json({error: true, message: 'Unable to send Facilities RT notification'});
          return;
        }
        backgroundCheck.facilitiesRtSent = true;
        backgroundCheck.facilitiesRtSentTimestamp = new Date().toISOString();
      }

      // update onboarding record
      backgroundCheck.message = payload.message || '';
      backgroundCheck.notificationSent = true;
      backgroundCheck.submittedBy = req.auth.token.id;
      const additionalData = {...onboardingRecord.additional_data, backgroundCheck};
      const update = await UcdlibOnboarding.update(onboardingRecord.id, {additionalData});
      if ( update.err ) {
        console.error(update.err);
        res.status(500).json({
          error: true,
          message: 'Unable to update onboarding request.'
        });
        return;
      }
      return res.json({success: true, data: backgroundCheck});
    });

  /**
   * @description Query for existing onboarding requests by the following query params:
   * statusId - status id of request
   * iamId - iam id of employee
   * rtTicketId - rt ticket id of request
   * supervisorId - iam id of supervisor
   * isOpen - boolean indicating whether request is open or closed
   */
  api.get('/onboarding', async (req, res) => {

    if (
      !req.auth.token.hasAdminAccess &&
      !req.auth.token.hasHrAccess &&
      req.auth.token.iamId != req.query.supervisorId ){
      res.status(403).json({
        error: true,
        message: 'Not authorized to access this resource.'
      });
      return;
    }

    const errorMsg = 'Unable to retrieve onboarding requests';
    const q = {
      statusId: req.query.statusId,
      iamId: req.query.iamId,
      rtTicketId: req.query.rtTicketId,
      supervisorId: req.query.supervisorId
    };
    if ( req.query.isOpen != undefined ) q['isOpen'] = req.query.isOpen;

    const r = await UcdlibOnboarding.query(q);
    if ( r.err ) {
      console.error(r.err);
      return res.status(500).json({error: true, message: errorMsg});
    }
    let groups = await UcdlibGroups.getAll();
    if ( groups.err ){
      console.error(groups.err);
      return res.status(500).json({error: true, message: errorMsg});
    }
    groups = Pg.recordsById(groups.res.rows);

    const output = r.res.rows.map(row => {
      row.group_ids.forEach(gid => {
        if ( groups[gid] && groups[gid].part_of_org ){
          row.department_name = groups[gid].name;
        }
      });
      row.department_name = row.department_name || '';
      return TextUtils.camelCaseObject(row);
    });
    return res.json(output);
  });
  }
