const ucdIam = require('./ucd-iam');
const groups = require('./groups');
const onboarding = require('./onboarding');

module.exports = (app) => {
  ucdIam(app);
  groups(app);
  onboarding(app);
}