module.exports = (api) => {
  api.get('/permissions/:id', async (req, res) => {
    const { default: PermissionsRequests } = await import('@ucd-lib/iam-support-lib/src/utils/permissions.js');
    const { default: TextUtils } = await import('@ucd-lib/iam-support-lib/src/utils/text.js');

    const idTypes = ['update', 'onboarding'];
    const idType = idTypes.includes(req.query.idType) ?  req.query.idType : 'update';

    let pRes;
    if ( idType === 'onboarding' ){
      pRes = await PermissionsRequests.getOnboardingPermissions(req.params.id);
    } else if ( idType === 'update' ) {
      pRes = await PermissionsRequests.getUpdatePermissions(req.params.id);
    }
    if ( pRes.err ){
      console.error(pRes.err);
      return res.status(400).json({error: true, message: 'Unable to retrieve permissions record'});
    }
    if ( !pRes.res.rows.length ){
      return res.status(404).json({error: true, message: 'Resource does not exist'});
    }
    if ( idType === 'onboarding' ){
      if (
        !req.auth.token.hasAdminAccess &&
        !req.auth.token.hasHrAccess &&
        req.auth.token.iamId != pRes.res.rows[0].supervisor_id) {
          return res.status(403).json({
            error: true,
            message: 'Not authorized to access this resource.'
          });
      }
    } else if ( idType === 'update' ) {
      if (
        !req.auth.token.hasAdminAccess &&
        !req.auth.token.hasHrAccess &&
        req.auth.token.userId != pRes.res.rows[0].submitted_by) {
          return res.status(403).json({
            error: true,
            message: 'Not authorized to access this resource.'
          });
      }
    }

    return res.json(TextUtils.camelCaseObject(pRes.res.rows[0]));
  });

  /**
   * @description Get all submitted permission requests (most recent version) made by current user
   */
  api.get('/submitted-permission-requests', async (req, res) => {
    const { default: PermissionsRequests } = await import('@ucd-lib/iam-support-lib/src/utils/permissions.js');
    const { default: TextUtils } = await import('@ucd-lib/iam-support-lib/src/utils/text.js');

    const userId = req.auth.token.id;
    const pRes = await PermissionsRequests.getAllBySubmitter(userId);
    if ( pRes.err ){
      console.error(pRes.err);
      return res.status(400).json({error: true, message: 'Unable to retrieve permissions records'});
    }
    return res.json(pRes.res.rows.map(r => TextUtils.camelCaseObject(r)));
  });

  api.post('/permissions', async (req, res) => {
    const { default: UcdlibOnboarding } = await import('@ucd-lib/iam-support-lib/src/utils/onboarding.js');
    const { default: UcdlibEmployees } = await import('@ucd-lib/iam-support-lib/src/utils/employees.js');
    const { default: iamAdmin } = await import('@ucd-lib/iam-support-lib/src/utils/admin.js');
    const { default: PermissionsRequests } = await import('@ucd-lib/iam-support-lib/src/utils/permissions.js');
    const { default: config } = await import('../lib/config.js');
    const { UcdlibRt, UcdlibRtTicket } = await import('@ucd-lib/iam-support-lib/src/utils/rt.js');
    const { UcdIamModel } = await import('@ucd-lib/iam-support-lib/index.js');
    const { default: IamPersonTransform } = await import('@ucd-lib/iam-support-lib/src/utils/IamPersonTransform.js');
    UcdIamModel.init(config.ucdIamApi);

    const action = req.body.action || 'onboarding';
    let canAccess = false;
    let onboardingStatus = 0;
    let ucdRecord, employeeRecord;
    let supervisorId = '';
    let userId = '';
    const data = {
      ...req.body,
      revision: 0,
      rtTicketId: null,
      additionalData: {}
    };

    if ( action === 'onboarding' ){
      data.needsSupervisorApproval = false;
      const [previousSubmission, onboardingRequest] = await Promise.all([
        PermissionsRequests.getOnboardingPermissions(data.onboardingRequestId),
        UcdlibOnboarding.getById(data.onboardingRequestId)
      ])
      if ( previousSubmission.res && previousSubmission.res.rows.length ){
        data.revision = previousSubmission.res.rows[0].revision + 1;
      }

      if (onboardingRequest.res && onboardingRequest.res.rows.length) {
        data.rtTicketId = onboardingRequest.res.rows[0].rt_ticket_id;
        data.iamId = onboardingRequest.res.rows[0].iam_id;
        supervisorId = onboardingRequest.res.rows[0].supervisor_id;
        onboardingStatus = onboardingRequest.res.rows[0].status_id;
        userId = onboardingRequest.res.rows[0].additional_data.employeeUserId;
      }
      if ( supervisorId == req.auth.token.iamId ) canAccess = true;
    } else if ( action === 'update' ) {
      canAccess = true;
      data.needsSupervisorApproval = false;

      if ( !data.permissionRequestId ) {
        const nextId = await PermissionsRequests.getNextPermissionId();
        if ( nextId.err ) {
          console.error(nextId.err);
          return res.status(400).json({error: true, message: 'Unable to create permissions request.'});
        }
        data.permissionRequestId = nextId.res.rows[0].nextval;
      } else {
        const previousSubmission = await PermissionsRequests.getUpdatePermissions(data.permissionRequestId);
        if ( previousSubmission.res && previousSubmission.res.rows.length ){
          data.revision = previousSubmission.res.rows[0].revision + 1;
          data.rtTicketId = previousSubmission.res.rows[0].rt_ticket_id;
        }
      }

      if ( !data.requestedPerson ){
        data.iamId = req.auth.token.iamId;
      } else {
        data.iamId = data.requestedPerson;
      }

      // Might need supervisor approval. lets check their records
      [ucdRecord, employeeRecord] = await Promise.all([
        UcdIamModel.getPersonByIamId(data.iamId),
        UcdlibEmployees.getById(data.iamId, 'iamId')
      ]);
      if ( employeeRecord.err ){
        console.error(employeeRecord.err);
        return res.status(400).json({error: true, message: 'Unable to create permissions request.'});
      }
      if ( ucdRecord.error ) {
        console.error(ucdRecord.error);
        return res.status(400).json({error: true, message: 'Unable to create permissions request. Person does not exist.'});
      }
      ucdRecord = new IamPersonTransform(ucdRecord);
      data.additionalData.employeeFirstName = ucdRecord.firstName;
      data.additionalData.employeeLastName = ucdRecord.lastName;

      // check if one of our employees. if not submitted by supervisor, needs approval
      if ( employeeRecord.res && employeeRecord.res.rows.length ) {
        data.needsSupervisorApproval = true;
        const employee = employeeRecord.res.rows[0];
        supervisorId = employee.supervisor_id;
        if ( supervisorId == req.auth.token.iamId ) data.needsSupervisorApproval = false;

      // not one of our employees - a law library employee for example
      // whoever is submitting the form for them is responsible for approval
      } else {
        data.needsSupervisorApproval = false;
      }
    }

    if ( !canAccess && req.auth.token.hasAdminAccess ) canAccess = true;
    if ( !canAccess ) {
      return res.status(403).json({
        error: true,
        message: 'Not authorized to access this resource.'
      });
    }

    data.submittedBy = req.auth.token.id;
    const r = await PermissionsRequests.create(data);
    if ( r.err ) {
      console.error(r.err);
      return res.status(400).json({error: true, message: 'Unable to create permissions request.'});
    }
    const output = r.res.rows[0];

    // send rt
    const rtClient = new UcdlibRt(config.rt);

    //send facilities RT if first onboarding request, and facilities is checked
    if ( action === 'onboarding' ){
      const facilitiesRes = await iamAdmin.sendFacilitiesRtRequest(data.onboardingRequestId, {rtConfig: config.rt});
      if ( facilitiesRes.error ) {
        console.error(facilitiesRes.message);
        await PermissionsRequests.delete(output.id);
        return res.status(400).json({error: true, message: 'Unable to create facilities RT request.'});
      }
    }


    // update existing onboarding/permissions request RT ticket
    if ( data.rtTicketId ){
      const ticket = new UcdlibRtTicket(false, {id: data.rtTicketId});
      let reply = ticket.createReply();
      reply.addSubject(`Permissions Request${data.revision > 0 ? ' (Update)': ''}`);
      addPermissionRtBody(reply, data, req, action == 'update');

      const rtResponse = await rtClient.sendCorrespondence(reply);
      if ( rtResponse.err )  {
        console.error(rtResponse);
        await PermissionsRequests.delete(output.id);
        return res.status(503).json({error: true, message: 'Unable to send RT request.'});
      }
      if ( action === 'onboarding' && onboardingStatus == UcdlibOnboarding.statusCodes.supervisor ) {
        let newStatus = UcdlibOnboarding.statusCodes.provisioning;
        if ( !data.iamId ){
          newStatus = UcdlibOnboarding.statusCodes.iamRecord;
        } else if (!userId){
          newStatus = UcdlibOnboarding.statusCodes.userId;
        }
        await UcdlibOnboarding.update(data.onboardingRequestId, {statusId: newStatus});
      }
    } else if ( action === 'update' ) {
      // check for supervisor
      let supervisor;
      if ( data.needsSupervisorApproval && supervisorId ) {
        supervisor = await UcdlibEmployees.getById(supervisorId, 'iamId');
        if ( supervisor.err || !supervisor.res.rows.length ) {
          console.error(supervisor.err);
          await PermissionsRequests.delete(output.id);
          return res.status(400).json({error: true, message: 'Unable to create permissions request.'});
        }
        supervisor = supervisor.res.rows[0];
      }

      // create new RT ticket
      const ticket = new UcdlibRtTicket();
      ticket.addOwner(config.rt.user);
      ticket.addSubject(`Permissions Request Update for ${ucdRecord.fullName}`);
      if ( supervisor ) {
        if ( config.rt.forbidCc ){
          console.log(`Forbidden to cc supervisor ${supervisor.email} on permissions request`);
        } else {
          ticket.addCc(supervisor.email);
        }
      }
      addPermissionRtBody(ticket, data, req, true);
      const rtResponse = await rtClient.createTicket(ticket);
      if ( rtResponse.err )  {
        console.error(rtResponse);
        await PermissionsRequests.delete(output.id);
        return res.json({error: true, message: 'Unable to send RT request.'});
      }
      await PermissionsRequests.setRtId(output.id, rtResponse.res.id);

      // write reply to supervisor requesting approval
      if ( supervisor ) {
        const ticket = new UcdlibRtTicket(false, {id: rtResponse.res.id});
        const reply = ticket.createReply();
        reply.addSubject(`Supervisor Action Required!`);
        reply.addContent(`Hi ${supervisor.first_name},`);
        reply.addContent(``);
        reply.addContent(`Please approve this permissions request for ${ucdRecord.fullName}.`);
        reply.addContent(``);
        reply.addContent('Thank you,');
        reply.addContent('Library ITIS');
        const replyResponse = await rtClient.sendCorrespondence(reply);
        if ( replyResponse.err )  {
          console.error(replyResponse);
          await PermissionsRequests.delete(output.id);
          return res.json({error: true, message: 'Unable to send RT request.'});
        }
      }

    }

    return res.json(output);
  })
};

/**
 * @description Construct RT body for permissions request
 * @param {RTTicket||RTCorrespondence} rtObject - Ticket or correspondence object
 * @param {Object} data - Permissions request data payload
 * @param {*} req - Express request object
 * @param {Boolean} skipIfEmpty - Skip adding permission to RT if value is empty
 */
const addPermissionRtBody = (rtObject, data, req, skipIfEmpty = false) => {
  const p = data.permissions;
  const permissions = [
    {name: 'Tech Equipment', value: p?.techEquipment},
    {name: 'Main Website', value: p?.mainWebsite},
    {name: 'Alma Roles', value: p?.alma?.roles, isArray: true},
    {name: 'Bigsys', value: p?.bigsys},
    {name: 'Facilities', value: p?.facilities},
    {name: 'Staff Intranet', value: p?.intranet},
    {name: 'Libcal', value: p?.libcal},
    {name: 'Libguides', value: p?.libguides},
    {name: 'Slack', value: p?.slack},
    {name: 'Calendly', value: p?.calendly},
    {name: 'Lang Prize', value: p?.langPrize},
    {name: 'Aggie Open', value: p?.aggieOpen}
  ];
  permissions.forEach(p => {
    try {
      if ( skipIfEmpty && !p.value ) return;
      rtObject.addContent(`<h4>${p.name}</h4>`);
      if ( p.isArray ){
        p.value.forEach(v => rtObject.addContent(v, true));
      } else {
        rtObject.addContent(p.value, false);
      }
    } catch (error) {}

  });

  if ( data.notes ){
    rtObject.addContent('<h4>Additional Notes</h4>');
    rtObject.addContent(data.notes, false);
  }

  rtObject.addContent();
  rtObject.addContent(`Requested by: ${ req.auth.token.email}`);
};
