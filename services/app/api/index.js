import express from 'express';
import ucdIam from './ucd-iam.js';
import config from './config.js';
import groups from './groups.js';
import onboarding from './onboarding.js';
import permissions from './permissions.js';
import separation from './separation.js';
import rt from './rt.js';
import auth from './auth.js';
import alma from './alma.js';
import ldap from './ldap.js'
import employees from './employees.js';
import orgchart from './orgchart.js'
import health from './health.js';
import rosetta from './rosetta.js';

const router = express.Router();

// middleware
auth(router);

// endpoints
ucdIam(router);
config(router);
groups(router);
onboarding(router);
separation(router);
permissions(router);
rt(router);
alma(router);
ldap(router);
orgchart(router);
employees(router);
rosetta(router);

export default (app) => {
  health(app);
  app.use('/api', router);
}
