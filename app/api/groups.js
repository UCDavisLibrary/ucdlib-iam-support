module.exports = (app) => {
  app.get('/api/groups', async (req, res) => {
    const { default: UcdlibGroups } = await import('@ucd-lib/iam-support-lib/src/utils/groups.js');
    const r = await UcdlibGroups.getAll();
    if ( r.err ) {
      console.error(r.err);
      res.status(500);
      res.json({error: true});
      return;
    }
    res.json(r.res.rows);
  });
}