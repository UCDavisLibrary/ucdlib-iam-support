module.exports = (api) => {
  api.get('/permissions/:id', async (req, res) => {
    const { default: UcdlibOnboarding } = await import('@ucd-lib/iam-support-lib/src/utils/onboarding.js');
    const { default: PermissionsRequests } = await import('@ucd-lib/iam-support-lib/src/utils/permissions.js');

    const idTypes = ['permission', 'onboarding'];
    const idType = idTypes.includes(req.query.idType) ?  req.query.idType : 'permission';

  });
  api.post('/permissions', async (req, res) => {
    const { default: UcdlibOnboarding } = await import('@ucd-lib/iam-support-lib/src/utils/onboarding.js');
    const { default: PermissionsRequests } = await import('@ucd-lib/iam-support-lib/src/utils/permissions.js');

    const action = req.body.action || 'onboarding';
    let canAccess = false;
    const data = {
      ...req.body,
      revision: 0,
      rtTicketId: null
    };

    if ( action === 'onboarding' ){
      let supervisorId = '';
      data.needsSupervisorApproval = false;
      const previousSubmission = await PermissionsRequests.getOnboardingPermissions(data.onboardingRequestId);
      if ( previousSubmission.res && previousSubmission.res.rows.length ){
        data.revision = previousSubmission.res.rows[0].revision + 1;
        data.rtTicketId = previousSubmission.res.rows[0].rt_ticket_id;
        data.iamId = previousSubmission.res.rows[0].iam_id;
        supervisorId = previousSubmission.res.rows[0].supervisor_id;
      } else {
        const onboardingRequest = await UcdlibOnboarding.getById(data.onboardingRequestId);
        if ( onboardingRequest.res && onboardingRequest.res.rows.length ){
          data.revision = 0;
          data.rtTicketId = onboardingRequest.res.rows[0].rt_ticket_id;
          data.iamId = onboardingRequest.res.rows[0].iam_id;
          supervisorId = onboardingRequest.res.rows[0].supervisor_id;
        }
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

    // do rt

    // if onboarding, update status
    
    return res.json(output);
  })
};