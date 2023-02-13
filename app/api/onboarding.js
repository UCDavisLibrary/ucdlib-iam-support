module.exports = (app) => {
  app.post('/api/onboarding/new', async (req, res) => {
    const { default: UcdlibOnboarding } = await import('@ucd-lib/iam-support-lib/src/utils/onboarding.js');
    return res.json(req.body);

  });
  }