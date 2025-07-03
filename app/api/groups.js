import UcdlibGroups from '@ucd-lib/iam-support-lib/src/utils/groups.js';
import TextUtils from '@ucd-lib/iam-support-lib/src/utils/text.js';

export default (api) => {
  /**
   * @description Retrieve all groups in local db
   */
  api.get('/groups', async (req, res) => {
    const r = await UcdlibGroups.getAll();
    if ( r.err ) {
      console.error(r.err);
      return res.status(500).json({error: true});
    }
    res.json(r.res.rows.map(row => TextUtils.camelCaseObject(row)));
  });

  /**
   * @description Retrieve by groups id in local db
   */
  api.get('/groups/:id', async (req, res) => {
    const r = await UcdlibGroups.getById([req.params.id],  {returnHead: true});
    if ( r.err ) {
      console.error(r.err);
      return res.status(500).json({error: true});
    }
    res.json(r.res.rows.map(row => TextUtils.camelCaseObject(row)));
  });

  /**
   * @description add groups head in local db
   */
  api.post('/groups/sethead/:id', async (req, res) => {
    if (
      !req.auth.token.hasAdminAccess &&
      !req.auth.token.hasHrAccess ){
      res.status(403).json({
        error: true,
        message: 'Not authorized to access this resource.'
      });
      return;
    }

    const r = await UcdlibGroups.setGroupHead(req.params.id, req.body.employeeRowID);
    if ( r.err ) {
      console.error(r.err);
      return res.status(500).json({error: true});
    }
    res.json(true);

  });

   /**
   * @description removes groups head in local db
   */
   api.post('/groups/removehead/:id', async (req, res) => {
    if (
      !req.auth.token.hasAdminAccess &&
      !req.auth.token.hasHrAccess ){
      res.status(403).json({
        error: true,
        message: 'Not authorized to access this resource.'
      });
      return;
    }

    const r = await UcdlibGroups.removeGroupHead(req.params.id);
    if ( r.err ) {
      console.error(r.err);
      return res.status(500).json({error: true});
    }
    res.json(true);

  });
}
