const express = require('express');
const router = express.Router();

const ucdIam = require('./ucd-iam');
const groups = require('./groups');
const onboarding = require('./onboarding');
const auth = require('./auth');

// middleware
auth(router);

// endpoints
ucdIam(router);
groups(router);
onboarding(router);

module.exports = (app) => {
  app.use('/api', router);
}