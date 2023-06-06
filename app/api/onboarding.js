module.exports = (api) => {
  api.post('/onboarding/new', async (req, res) => {
    if ( !req.auth.token.canCreateRequests ){
      res.status(403).json({
        error: true,
        message: 'Not authorized to access this resource.'
      });
      return;
    }
    const { default: UcdlibOnboarding } = await import('@ucd-lib/iam-support-lib/src/utils/onboarding.js');
    const { default: UcdlibGroups } = await import('@ucd-lib/iam-support-lib/src/utils/groups.js');
    const { default: config } = await import('../lib/config.js');
    const { UcdlibRt, UcdlibRtTicket } = await import('@ucd-lib/iam-support-lib/src/utils/rt.js');
    const { default: UcdlibEmployees } = await import('@ucd-lib/iam-support-lib/src/utils/employees.js');
    const payload = req.body;
    if ( !payload.additionalData ) payload.additionalData = {};

    payload.submittedBy = req.auth.token.id;
    payload.modifiedBy = req.auth.token.id;

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
      res.json({error: true, message: 'Unable to create onboarding request.'});
      return;
    }
    const output = r.res.rows[0];

    // needed variables
    const ad = payload.additionalData;
    const notifySupervisor = ad.supervisorEmail && !ad.skipSupervisor;
    let department =  await UcdlibGroups.getDepartmentsById(payload.groupIds || []);
    department = department.res && department.res.rows.length ? department.res.rows[0].name : '';
    const employeeName = `${ad.employeeLastName}, ${ad.employeeFirstName}`;

    // create rt ticket
    const rtClient = new UcdlibRt(config.rt);
    const ticket = new UcdlibRtTicket();

    ticket.addSubject(`Onboarding: ${employeeName}`);
    ticket.addOwner(config.rt.user);

    if ( !config.rt.forbidCc) {
      if ( notifySupervisor ) {
        ticket.addCc( ad.supervisorEmail );
        if ( transfer.isTransfer ) {
          const e = transfer.employeeRecord.supervisor.email;
          if ( e && e != ad.supervisorEmail ) ticket.addCc( e );
        }
      }
    }


    // ticket content
    ticket.addContent();
    ticket.addContent(`<h4>Employee</h4>`);
    ticket.addContent({
      'Name': employeeName,
      'Email': ad.employeeEmail || '????',
      'Employee Id': ad.employeeId || '????',
      'User Id (kerberos)': ad.employeeUserId || '????',
      'UCD IAM ID': payload.iamId || '????'
    }, false);
    ticket.addContent(`<h4>Position</h4>`);
    ticket.addContent({
      'Title': payload.libraryTitle,
      'Department': department,
      'Start Date': payload.startDate,
      'Supervisor': `${ad.supervisorLastName}, ${ad.supervisorFirstName}`
    }, false);
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
      res.json({error: true, message: 'Unable to create an RT ticket for this request.'});
      return;
    }

    // send correspondence to supervisor
    if ( notifySupervisor ){
      const supervisorName = ad.supervisorFirstName && ad.supervisorLastName ? `${ad.supervisorFirstName} ${ad.supervisorLastName}` : 'Supervisor';
      const supervisorLink = `${config.baseUrl}/permissions/onboarding/${output.id}`;
      const reply = ticket.createReply();
      reply.addSubject(`Supervisor Action Required!`);
      reply.addContent(`Hi ${supervisorName},`);
      reply.addContent('');
      reply.addContent(`To proceed with your employee's onboarding, please describe the accounts and permissions required to perform their essential job duties using the following form:`);
      reply.addContent('');
      reply.addContent(`<a href='${supervisorLink}'>${supervisorLink}</a>`);
      const replyResponse = await rtClient.sendCorrespondence(reply);
      if ( replyResponse.err )  {
        console.error(replyResponse);
        await UcdlibOnboarding.delete(output.id);
        res.json({error: true, message: 'Unable to send RT request to supervisor.'});
        return;
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
    const { default: PermissionsRequests } = await import('@ucd-lib/iam-support-lib/src/utils/permissions.js');
    const { default: UcdlibOnboarding } = await import('@ucd-lib/iam-support-lib/src/utils/onboarding.js');
    const { UcdIamModel } = await import('@ucd-lib/iam-support-lib/index.js');
    const { default: IamPersonTransform } = await import('@ucd-lib/iam-support-lib/src/utils/IamPersonTransform.js');
    const { default: TextUtils } = await import('@ucd-lib/iam-support-lib/src/utils/text.js');
    const { UcdlibRt, UcdlibRtTicket } = await import('@ucd-lib/iam-support-lib/src/utils/rt.js');
    const { default: config } = await import('../lib/config.js');

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

    const { default: UcdlibOnboarding } = await import('@ucd-lib/iam-support-lib/src/utils/onboarding.js');
    const r = await UcdlibOnboarding.getByName(req.query.firstName, req.query.lastName);
    if ( r.err ) {
      console.error(r.err);
      res.json({error: true, message: 'Unable to retrieve SEARCH onboarding request'});
      return;
    }
    if ( !r.res.rows.length ){
      console.error(r.err);
      res.json({error: true, message: 'Request does not exist!'});
      return;
    }

    return res.json(r.res.rows);

  });

  api.get('/onboarding/:id', async (req, res) => {
    const { default: UcdlibOnboarding } = await import('@ucd-lib/iam-support-lib/src/utils/onboarding.js');
    const { default: TextUtils } = await import('@ucd-lib/iam-support-lib/src/utils/text.js');
    const { default: UcdlibGroups } = await import('@ucd-lib/iam-support-lib/src/utils/groups.js');
    const { default: Pg } = await import('@ucd-lib/iam-support-lib/src/utils/pg.js');

    // TODO: move auth here. change query to be by supervisorId as well for non hr/admin request

    const r = await UcdlibOnboarding.getById(req.params.id);
    if ( r.err ) {
      console.error(r.err);
      res.json({error: true, message: 'Unable to retrieve onboarding request'});
      return;
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
      res.json({error: true, message: errorMsg});
      return;
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

  api.get('/onboarding', async (req, res) => {
    const { default: UcdlibOnboarding } = await import('@ucd-lib/iam-support-lib/src/utils/onboarding.js');
    const { default: TextUtils } = await import('@ucd-lib/iam-support-lib/src/utils/text.js');
    const { default: UcdlibGroups } = await import('@ucd-lib/iam-support-lib/src/utils/groups.js');
    const { default: Pg } = await import('@ucd-lib/iam-support-lib/src/utils/pg.js');

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
      res.json({error: true, message: errorMsg});
      return;
    }
    let groups = await UcdlibGroups.getAll();
    if ( groups.err ){
      console.error(groups.err);
      res.json({error: true, message: errorMsg});
      return;
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
