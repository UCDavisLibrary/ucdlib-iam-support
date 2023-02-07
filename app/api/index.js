const ucdIam = require('./ucd-iam');
const groups = require('./groups');

module.exports = (app) => {
  ucdIam(app);
  groups(app);
}