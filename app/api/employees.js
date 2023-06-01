module.exports = (api) => {
  api.get('/employees/direct-reports', async (req, res) => {
    const { default: UcdlibEmployees } = await import('@ucd-lib/iam-support-lib/src/utils/employees.js');
    const { default: TextUtils } = await import('@ucd-lib/iam-support-lib/src/utils/text.js')
    const iamId = req.auth.token.iamId;
    if ( !iamId ) {
      res.json([]);
      return;
    }
    const r = await UcdlibEmployees.getDirectReports(iamId);
    if ( r.err ) {
      console.error(r.err);
      res.status(500);
      res.json({error: true});
      return;
    }
    res.json(r.res.rows.map(row => TextUtils.camelCaseObject(row)));
  });


  api.get('/employees/search', async (req, res) => {
    const { default: UcdlibEmployees } = await import('@ucd-lib/iam-support-lib/src/utils/employees.js');
    const { default: TextUtils } = await import('@ucd-lib/iam-support-lib/src/utils/text.js');

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
