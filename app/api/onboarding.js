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
    const payload = req.body;

    payload.submittedBy = req.auth.token.id;
    payload.modifiedBy = req.auth.token.id;

    const r = await UcdlibOnboarding.create(payload);
    if ( r.err ) {
      console.error(r.err);
      res.json({error: true, message: 'Unable to create onboarding request.'});
      return;
    }
    const output = r.res.rows[0];

    // needed variables
    const ad = payload.additionalData || {};
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
      if ( notifySupervisor ) ticket.addCc( ad.supervisorEmail );

      // todo - add checkbox to allow cc'ing the employee
      // if ( ad.employeeEmail ) ticket.addCc( ad.employeeEmail );
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

  api.get('/onboarding/reconciliation', async (req, res) => {
    const { default: UcdlibOnboarding } = await import('@ucd-lib/iam-support-lib/src/utils/onboarding.js');

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


    const data = {};
    data.iamId = payload.iamId;
    data.modifiedBy = req.auth.token.id;
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
