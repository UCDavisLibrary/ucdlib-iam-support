import express from 'express';
import config from "../lib/config.js";
import protect from '../lib/protect.js';

import employees from './employees.js';
import groups from './groups.js';

const router = express.Router();

// must have at least 'read' role for api client
protect(router);

// routes
employees(router);
groups(router);

export default (app) => {
  app.use(config.apiPrefix, router);
}
