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
}
