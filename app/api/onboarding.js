module.exports = (app) => {
  app.post('/api/onboarding/new', async (req, res) => {
    const { default: UcdlibOnboarding } = await import('@ucd-lib/iam-support-lib/src/utils/onboarding.js');
    const payload = req.body;

    // TODO: set submittedBy and modifiedBy properties


    const r = await UcdlibOnboarding.create(payload);
    if ( r.err ) {
      console.error(r.err);
      res.json({error: true, message: 'Unable to create onboarding request.'});
      return;
    }
    const output = r.res.rows[0];

    // create rt
    // update submission if successful, delete if not
    return res.json(output);

  });
  }