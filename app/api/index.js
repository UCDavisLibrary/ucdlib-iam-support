import express from 'express';
import ucdIam from './ucd-iam.js';
import groups from './groups.js';
import onboarding from './onboarding.js';
import permissions from './permissions.js';
import separation from './separation.js';
import rt from './rt.js';
import auth from './auth.js';
import alma from './alma.js';
import employees from './employees.js';
import orgchart from './orgchart.js'

const router = express.Router();

// middleware
auth(router);

// endpoints
ucdIam(router);
groups(router);
onboarding(router);
separation(router);
permissions(router);
rt(router);
alma(router);
orgchart(router);
employees(router);

export default (app) => {
  app.use('/api', router);
}
