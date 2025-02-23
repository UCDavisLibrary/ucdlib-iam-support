import UcdlibEmployees from '@ucd-lib/iam-support-lib/src/utils/employees.js';
import TextUtils from '@ucd-lib/iam-support-lib/src/utils/text.js';

export default (api) => {

  /**
   * @description get all direct reports for a user, from local db
   * Returns blank array if no reports
   */
  api.get('/employees/direct-reports', async (req, res) => {
    const iamId = req.auth.token.iamId;
    if ( !iamId ) {
      res.json([]);
      return;
    }
    const r = await UcdlibEmployees.getDirectReports(iamId);
    if ( r.err ) {
      console.error(r.err);
      return res.status(500).json({error: true});
    }
    res.json(r.res.rows.map(row => TextUtils.camelCaseObject(row)));
  });

  /**
   * @description search for library employees from local db. Can use the following url query parameters:
   * - name: search by name
   */
  api.get('/employees/search', async (req, res) => {
    if ( !req.auth.token.canCreateRequests ){
      res.status(403).json({
        error: true,
        message: 'Not authorized to access this resource.'
      });
      return;
    }

    const queryVars = ['name'];
    if ( !queryVars.some(q => req.query[q]) ) {
      res.status(400).json({
        error: true,
        message: 'Missing query parameter.  Must include one of: ' + queryVars.join(', ')
      });
      return;
    }

    const limit = 10;
    const out = {
      total: 0,
      results: [],
    }

    if ( req.query.name ) {
      const r = await UcdlibEmployees.searchByName(req.query.name);
      if ( r.err ) {
        console.error(r.err);
        res.status(500).json({error: true});
        return;
      }
      out.total = r.res.rowCount;
      out.results = r.res.rows.slice(0, limit).map(row => TextUtils.camelCaseObject(row));
    }

    return res.json(out);
  });
}
