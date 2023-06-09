module.exports = (api) => {
    api.post('/separation/new', async (req, res) => {
      if ( !req.auth.token.canCreateRequests ){
        res.status(403).json({
          error: true,
          message: 'Not authorized to access this resource.'
        }); 
        return;
      }

      const { default: UcdlibSeparation } = await import('@ucd-lib/iam-support-lib/src/utils/separation.js');
      const { default: config } = await import('../lib/config.js');
      const { UcdlibRt, UcdlibRtTicket } = await import('@ucd-lib/iam-support-lib/src/utils/rt.js');
      const payload = req.body;

      if ( !payload.additionalData ) payload.additionalData = {};
  
      payload.submittedBy = req.auth.token.id;
  
      const r = await UcdlibSeparation.create(payload);
      if ( r.err ) {
        console.error(r.err);
        res.json({error: true, message: 'Unable to create onboarding request.'});
        return;
      }
      const output = r.res.rows[0];

      // needed variables
      const ad = payload.additionalData;
      const notifySupervisor = ad.supervisorEmail;
      const employeeName = `${ad.employeeLastName}, ${ad.employeeFirstName}`;
  
      // create rt ticket
      const rtClient = new UcdlibRt(config.rt);
      const ticket = new UcdlibRtTicket();
  
      ticket.addSubject(`Separation: ${employeeName}`);
      ticket.addOwner(config.rt.user);
  
      if ( !config.rt.forbidCc) {
        if ( notifySupervisor ) {
          ticket.addCc( ad.supervisorEmail );
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
      ticket.addContent(`<h4>Details</h4>`);
      ticket.addContent({
        'Separation Date': payload.separationDate,
        'Supervisor': `${ad.supervisorLastName}, ${ad.supervisorFirstName}`
      }, false);
      if ( payload.notes ){
        ticket.addContent(`<h4>Notes</h4>`);
        ticket.addContent(payload.notes, false);
      }
      ticket.addContent('');
      ticket.addContent(`<a href='${config.baseUrl}/separation/${output.id}'>View entire onboarding record.</a>`)
  
      // send ticket to RT for creation
      const rtResponse = await rtClient.createTicket(ticket);
      if ( rtResponse.err || !rtResponse.res.id )  {
        console.error(rtResponse);
        await UcdlibSeparation.delete(output.id);
        res.json({error: true, message: 'Unable to create an RT ticket for this request.'});
        return;
      }
  
      // send correspondence to supervisor
      if ( notifySupervisor ){
        const supervisorName = ad.supervisorFirstName && ad.supervisorLastName ? `${ad.supervisorFirstName} ${ad.supervisorLastName}` : 'Supervisor';
        const supervisorLink = `${config.baseUrl}/permissions/separation/${output.id}`;
        const reply = ticket.createReply();
        reply.addSubject(`Supervisor Action Required!`);
        reply.addContent(`Hi ${supervisorName},`);
        reply.addContent('');
        reply.addContent(`To proceed with your employee's separation, please follow the separation guide list`);
        reply.addContent('');
        reply.addContent(`<a href='${supervisorLink}'>${supervisorLink}</a>`);
        const replyResponse = await rtClient.sendCorrespondence(reply);
        if ( replyResponse.err )  {
          console.error(replyResponse);
          await UcdlibSeparation.delete(output.id);
          res.json({error: true, message: 'Unable to send RT request to supervisor.'});
          return;
        }
      }
  
      await UcdlibSeparation.update(output.id, {rtTicketId: rtResponse.res.id});
      return res.json(output);
  
    });
  
    /**
     * @description Reconcile an separation request with a UC Davis IAM record
     * Used if a manual submission does not have a unique identifier
     * Someone must come back later and match the records
     */
    api.post('/separation/reconcile', async (req, res) => {
      const { default: PermissionsRequests } = await import('@ucd-lib/iam-support-lib/src/utils/permissions.js');
      const { default: UcdlibSeparation } = await import('@ucd-lib/iam-support-lib/src/utils/separation.js');
      const { UcdIamModel } = await import('@ucd-lib/iam-support-lib/index.js');
      const { default: IamPersonTransform } = await import('@ucd-lib/iam-support-lib/src/utils/IamPersonTransform.js');
      const { default: TextUtils } = await import('@ucd-lib/iam-support-lib/src/utils/text.js');
      const { UcdlibRt, UcdlibRtTicket } = await import('@ucd-lib/iam-support-lib/src/utils/rt.js');
      const { default: config } = await import('../lib/config.js');
  
      // make sure request is formatted correctly
      const payload = req.body;
      const ids = ['separationId', 'iamId'];
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
      let separationRecord = await UcdlibSeparation.getById(payload.separationId);
      if ( separationRecord.err ) {
        console.error(separationRecord.err);
        res.status(400).json({error: true, message: 'Unable to retrieve separation request'});
        return;
      }
      if ( !separationRecord.res.rows.length ){
        console.error(separationRecord.err);
        res.status(400).json({error: true, message: 'Request does not exist!'});
        return;
      }
      separationRecord = TextUtils.camelCaseObject(separationRecord.res.rows[0]);
      if (
        !req.auth.token.hasAdminAccess &&
        !req.auth.token.hasHrAccess &&
        req.auth.token.iamId != separationRecord.supervisorId ){
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
      if ( separationRecord.rtTicketId ) {
        const rtClient = new UcdlibRt(config.rt);
        const ticket = new UcdlibRtTicket(false, {id: separationRecord.rtTicketId});
        let reply = ticket.createReply();
        reply.addSubject(`Separation Record Reconciled with UC Davis IAM System`);
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
        additionalData: separationRecord.additionalData || {},
      };
      data.additionalData.employeeId = iamRecord.employeeId;
      data.additionalData.employeeEmail = iamRecord.email;
      data.additionalData.employeeUserId = iamRecord.userId;

      const update = await UcdlibSeparation.update(separationRecord.id, data);
      if ( update.err ) {
        console.error(update.err);
        res.status(500).json({
          error: true,
          message: 'Unable to update separation request.'
        });
        return;
      }
      return res.json({success: true});
    });
  
    api.get('/separation/search', async (req, res) => {
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
  
      const { default: UcdlibSeparation } = await import('@ucd-lib/iam-support-lib/src/utils/separation.js');
      const r = await UcdlibSeparation.getByName(req.query.firstName, req.query.lastName);
      if ( r.err ) {
        console.error(r.err);
        res.json({error: true, message: 'Unable to retrieve SEARCH separation request'});
        return;
      }
      if ( !r.res.rows.length ){
        console.error(r.err);
        res.json({error: true, message: 'Request does not exist!'});
        return;
      }
  
      return res.json(r.res.rows);
  
    });
  
    api.get('/separation/:id', async (req, res) => {
      const { default: UcdlibSeparation } = await import('@ucd-lib/iam-support-lib/src/utils/separation.js');
      const { default: TextUtils } = await import('@ucd-lib/iam-support-lib/src/utils/text.js');
  
      if (
        !req.auth.token.hasAdminAccess &&
        !req.auth.token.hasHrAccess ){
        res.status(403).json({
          error: true,
          message: 'Not authorized to access this resource.'
        });
        return;
      }

      
  
      if ( Object.keys(req.query).length != 0 ){
       const r = await UcdlibSeparation.update(req.params.id, req.query);
        if ( r.err ) {
          console.error(r.err);
          res.json({error: true, message: 'Unable to retrieve separation request'});
          return;
        }
        if ( !r.res.rows.length ){
          console.error(r.err);
          res.json({error: true, message: 'Request does not exist!'});
          return;
        }
        const obReq = TextUtils.camelCaseObject(r.res.rows[0]);
        return res.json(obReq);

      } else {
       const r = await UcdlibSeparation.getById(req.params.id);
        if ( r.err ) {
          console.error(r.err);
          res.json({error: true, message: 'Unable to retrieve separation request'});
          return;
        }
        if ( !r.res.rows.length ){
          console.error(r.err);
          res.json({error: true, message: 'Request does not exist!'});
          return;
        }
        const obReq = TextUtils.camelCaseObject(r.res.rows[0]);
        return res.json(obReq);
      }
  
    });
  
    api.get('/separation', async (req, res) => {
      const { default: UcdlibSeparation } = await import('@ucd-lib/iam-support-lib/src/utils/separation.js');
      const { default: TextUtils } = await import('@ucd-lib/iam-support-lib/src/utils/text.js');

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

      if ( req.query.isOpen != undefined ) q['isOpen'] = req.query.isOpen;
  
      const errorMsg = 'Unable to retrieve onboarding requests';
      const q = {
        iamId: req.query.iamId,
        rtTicketId: req.query.rtTicketId,
        supervisorId: req.query.supervisorId
      };
  
      const r = await UcdlibSeparation.query(q);
      if ( r.err ) {
        console.error(r.err);
        res.json({error: true, message: errorMsg});
        return;
      }

  
      const output = r.res.rows.map(row => {
        return TextUtils.camelCaseObject(row);
      });
      return res.json(output);
    });
    }
  