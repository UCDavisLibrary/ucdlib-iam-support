import config from '../lib/config.js';
import { UcdlibRt, UcdlibRtTicket } from '@ucd-lib/iam-support-lib/src/utils/rt.js';
import UcdlibOnboarding from '@ucd-lib/iam-support-lib/src/utils/onboarding.js';

export default (api) => {

  /**
   * @description Get ticket history
   */
  api.get('/rt/history/:id', async (req, res) => {
    const rtClient = new UcdlibRt(config.rt);

    // auth
    if ( !req.auth.token.hasAdminAccess && !req.auth.token.hasHrAccess ){
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
