import config from "#lib/utils/config.js";
import models from '#models';
import handleError from './handleError.js';

export default (api) => {

  /**
   * @description Get ticket history
   */
  api.get('/rt/history/:id', async (req, res) => {
    try {
      const rtClient = new models.rt(config.rt);

      // auth
      if ( !req.auth.token.hasAdminAccess && !req.auth.token.hasHrAccess ){
        const onboarding = await models.onboarding.query({rtTicketId: req.params.id, supervisorId: req.auth.token.iamId});
        if ( onboarding.err ) {
          console.error(onboarding.err);
          return res.status(500).json({error: true});
        }
        const separation = await models.separation.query({rtTicketId: req.params.id, supervisorId: req.auth.token.iamId});
        if ( separation.err ) {
          console.error(separation.err);
          return res.status(500).json({error: true});
        }
        if ( !onboarding.res?.rowCount && !separation.res?.rowCount ) {
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

    } catch (e) {
      return handleError(res, req, e);
    }
  })
}
