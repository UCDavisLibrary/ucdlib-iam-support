module.exports = (api) => {

  /**
   * @description Get ticket history
   */
  api.get('/rt/history/:id', async (req, res) => {
    const { default: config } = await import('../lib/config.js');
    const { UcdlibRt } = await import('@ucd-lib/iam-support-lib/src/utils/rt.js');
    const rtClient = new UcdlibRt(config.rt);
    
    // auth
    if ( !req.auth.token.hasAdminAccess && !req.auth.token.hasHrAccess ){
      const { default: UcdlibOnboarding } = await import('@ucd-lib/iam-support-lib/src/utils/onboarding.js');
      const r = UcdlibOnboarding.query({rtTicketId: req.params.id, supervisorId: req.auth.token.iamId});
      if ( r.err || !r.res.rows.length ){
        console.error(r.err);
        res.status(403).json({
          error: true,
          message: 'Not authorized to access this resource.'
        });
        return;
      }
    }

    // fetch
    const params = {
      fields: 'Type,OldValue,NewValue,Field,Created,Creator',
      'fields[Creator]': 'Name,id,RealName',
      per_page: 100
    }
    const rtResponse = await rtClient.getTicketHistory(req.params.id, params);
    if ( rtResponse.err )  {
      console.error(rtResponse);
      res.json({error: true, message: 'Unable to fetch ticket history'});
      return;
    }

    res.json(rtResponse.res);
  })
}