const express = require('express');
const router = express.Router();

const ucdIam = require('./ucd-iam');
const groups = require('./groups');
const onboarding = require('./onboarding');
const permissions = require('./permissions');
const rt = require('./rt');
const auth = require('./auth');
const alma = require('./alma');
const employees = require('./employees');

// middleware
auth(router);

// endpoints
ucdIam(router);
groups(router);
onboarding(router);
permissions(router);
rt(router);
alma(router);
employees(router);

module.exports = (app) => {
  app.use('/api', router);
}
