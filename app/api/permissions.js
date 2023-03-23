module.exports = (api) => {
  api.get('/permissions/:id', async (req, res) => {
    const { default: PermissionsRequests } = await import('@ucd-lib/iam-support-lib/src/utils/permissions.js');
    const { default: TextUtils } = await import('@ucd-lib/iam-support-lib/src/utils/text.js');

    const idTypes = ['permission', 'onboarding'];
    const idType = idTypes.includes(req.query.idType) ?  req.query.idType : 'permission';

    if ( idType === 'onboarding' ){
      const pRes = await PermissionsRequests.getOnboardingPermissions(req.params.id);
      if ( pRes.error ){
        console.error(pRes.error);
        return res.status(400).json({error: true, message: 'Unable to retrieve permissions record'});
      }
      if ( !pRes.res.rows.length ){
        return res.status(404).json({error: true, message: 'Resource does not exist'});
      }
      if ( 
        !req.auth.token.hasAdminAccess && 
        !req.auth.token.hasHrAccess &&
        req.auth.token.iamId != pRes.res.rows[0].supervisor_id) {
          return res.status(403).json({
            error: true,
            message: 'Not authorized to access this resource.'
          });
        }
      return res.json(TextUtils.camelCaseObject(pRes.res.rows[0]));
    };

  });
  api.post('/permissions', async (req, res) => {
    const { default: UcdlibOnboarding } = await import('@ucd-lib/iam-support-lib/src/utils/onboarding.js');
    const { default: PermissionsRequests } = await import('@ucd-lib/iam-support-lib/src/utils/permissions.js');
    const { default: config } = await import('../lib/config.js');
    const { UcdlibRt, UcdlibRtTicket } = await import('@ucd-lib/iam-support-lib/src/utils/rt.js');

    const action = req.body.action || 'onboarding';
    let canAccess = false;
    let onboardingStatus = 0;
    let userId = '';
    const data = {
      ...req.body,
      revision: 0,
      rtTicketId: null
    };

    if ( action === 'onboarding' ){
      let supervisorId = '';
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
    const permissions = [
      {name: 'Tech Equipment', value: data.permissions.techEquipment},
      {name: 'Main Website', value: data.permissions.mainWebsite},
      {name: 'Bigsys', value: data.permissions.bigsys},
      {name: 'Facilities', value: data.permissions.facilities},
      {name: 'Staff Intranet', value: data.permissions.intranet},
      {name: 'Libcal', value: data.permissions.libcal},
      {name: 'Libguides', value: data.permissions.libguides},
      {name: 'Slack', value: data.permissions.slack}
    ];

    // TODO: send facilities RT if first onboarding request, and facilities is checked

    if ( action === 'onboarding' && data.rtTicketId ){
      const ticket = new UcdlibRtTicket(false, {id: data.rtTicketId});
      const reply = ticket.createReply();
      reply.addSubject(`Permissions Request${data.revision > 0 ? ' (Update)': ''}`);

      // loop permissions and add to reply
      permissions.forEach(p => {
        reply.addContent(`<h4>${p.name}</h4>`);
        reply.addContent(p.value, false);
      });

      if ( data.notes ){
        reply.addContent('<h4>Additional Notes</h4>');
        reply.addContent(data.notes, false);
      }

      // TODO: Lookup user
      reply.addContent();
      reply.addContent(`Requested by: ${ req.auth.token.email}`);


      const rtResponse = await rtClient.sendCorrespondence(reply);
      if ( rtResponse.err )  {
        console.error(rtResponse);
        await PermissionsRequests.delete(output.id);
        return res.json({error: true, message: 'Unable to send RT request.'});
      }
      if ( onboardingStatus == 2 ) {
        let newStatus = 5;
        if ( !data.iamId ){
          newStatus = 3;
        } else if (!userId){
          newStatus = 4;
        } 
        await UcdlibOnboarding.update(data.onboardingRequestId, {statusId: newStatus});
      }
    }
    
    return res.json(output);
  })
};