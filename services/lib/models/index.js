import admin from './admin.js'
import backupLog from './backupLog.js';
import cache from './cache.js';
import employees from './employees.js';
import getByName from './getByName.js';
import groups from './groups.js';
import jobs from './jobs.js';
import keycloakAdmin from './keycloakAdmin.js';
import onboarding from './onboarding.js';
import permissions from './permissions.js';
import { UcdlibRt, UcdlibRtTicket } from './rt.js';
import separation from './separation.js';
import SystemAccessRecord from './SystemAccessRecord.js';


export default { 
  admin,
  backupLog,
  cache,
  employees,
  getByName,
  groups,
  jobs,
  keycloakAdmin,
  onboarding,
  permissions,
  rt: UcdlibRt,
  rtTicket: UcdlibRtTicket,
  separation,
  SystemAccessRecord
}