const { rt } = require('../lib/config.js');

module.exports = (app) => {
  app.post('/api/onboarding/new', async (req, res) => {
    const { default: UcdlibOnboarding } = await import('@ucd-lib/iam-support-lib/src/utils/onboarding.js');
    const { default: UcdlibGroups } = await import('@ucd-lib/iam-support-lib/src/utils/groups.js');
    const { default: config } = await import('../lib/config.js');
    const { UcdlibRt, UcdlibRtTicket } = await import('@ucd-lib/iam-support-lib/src/utils/rt.js');
    const payload = req.body;

    // TODO: set submittedBy and modifiedBy properties


    const r = await UcdlibOnboarding.create(payload);
    if ( r.err ) {
      console.error(r.err);
      res.json({error: true, message: 'Unable to create onboarding request.'});
      return;
    }
    const output = r.res.rows[0];

    // create rt ticket
    const ad = payload.additionalData || {};
    let department =  await UcdlibGroups.getDepartmentsById(payload.groupIds || []);
    department = department.res && department.res.rows.length ? department.res.rows[0].name : '';
    const employeeName = `${ad.employeeLastName}, ${ad.employeeFirstName}`;
    const rtClient = new UcdlibRt(config.rt);
    const ticket = new UcdlibRtTicket();

    ticket.addContent();
    ticket.addContent(`<h4>Employee</h4>`);
    ticket.addContent({
      'Name': employeeName,
      'Email': ad.employeeEmail || '????',
      'Employee Id': ad.employeeId || '????',
      'User Id (kerberos)': ad.employeeUserId || '????',
      'UCD IAM ID': payload.iamId
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
      ticket.addContent(payload.notes);
    }
    ticket.addContent(`<a href='${config.baseUrl}/onboarding/${output.id}'>View entire onboarding record.</a>`)

    ticket.addSubject(`Onboarding: ${employeeName}`);
    const rtResponse = await rtClient.createTicket(ticket);
    if ( rtResponse.err || !rtResponse.res.id )  {
      console.error(rtResponse);
      await UcdlibOnboarding.delete(output.id);
      res.json({error: true, message: 'Unable to create an RT ticket for this request.'});
      return;
    }
    await UcdlibOnboarding.update(output.id, {rtTicketId: rtResponse.res.id});
    return res.json(output);

  });

  app.get('/api/onboarding/:id', async (req, res) => {
    const { default: UcdlibOnboarding } = await import('@ucd-lib/iam-support-lib/src/utils/onboarding.js');
    const { default: TextUtils } = await import('@ucd-lib/iam-support-lib/src/utils/text.js')

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
    return res.json(TextUtils.camelCaseObject(r.res.rows[0]));

  });

  app.get('/api/onboarding', async (req, res) => {
    const { default: UcdlibOnboarding } = await import('@ucd-lib/iam-support-lib/src/utils/onboarding.js');
    const { default: TextUtils } = await import('@ucd-lib/iam-support-lib/src/utils/text.js');
    const { default: UcdlibGroups } = await import('@ucd-lib/iam-support-lib/src/utils/groups.js');
    const { default: Pg } = await import('@ucd-lib/iam-support-lib/src/utils/pg.js');


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