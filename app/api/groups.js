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
      res.status(500);
      res.json({error: true});
      return;
    }
    res.json(r.res.rows.map(row => TextUtils.camelCaseObject(row)));
  });
}
