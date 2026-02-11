import config from "#lib/utils/config.js";
import models from '#models';

export default (api) => {

  /**
   * @description Get ticket history
   */
  api.get('/rt/history/:id', async (req, res) => {
    const rtClient = new models.rt(config.rt);

    // auth
    if ( !req.auth.token.hasAdminAccess && !req.auth.token.hasHrAccess ){
      const r = await models.onboarding.query({rtTicketId: req.params.id, supervisorId: req.auth.token.iamId});
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
      fields: 'Type,OldValue,NewValue,Field,Created,Creator,Data',
      'fields[Creator]': 'Name,id,RealName',
      per_page: 100
    }
    const rtResponse = await rtClient.getTicketHistory(req.params.id, params);
    if ( rtResponse.err )  {
      console.error(rtResponse);
      return res.status(500).json({error: true, message: 'Unable to fetch ticket history'});
    }

    res.json(rtResponse.res);
  })
}
