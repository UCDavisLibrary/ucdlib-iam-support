import config from '../lib/config.js';
import backupLog from '@ucd-lib/iam-support-lib/src/utils/backupLog.js';
import jobs from '@ucd-lib/iam-support-lib/src/utils/jobs.js';
import fetch from 'node-fetch';

export default (app) => {
  app.get('/health', async (req, res) => {
    try {
      const services = {};

      // check last time backup service was successfully run
      const backupLogExists = await backupLog.tableExists();
      if ( backupLogExists && config.backup.statusFailAfterInterval ) {
        const lastBackup = await backupLog.lastBackupWithinInterval();

        if ( lastBackup.error ){
          throw lastBackup.error;
        }

        services.backup = {
          status: lastBackup.res.rows.length > 0 ? 'pass' : 'fail',
          failAfterInterval: config.backup.statusFailAfterInterval
        };

        if ( lastBackup.res.rows.length ) {
          services.backup.lastBackup = lastBackup.res.rows[0].backup_time;
        } else {
          let b = await backupLog.lastBackup();
          if ( b.error ) {
            throw b.error;
          }
          services.backup.lastBackup = b.res?.rows?.[0]?.backup_time || null;
        }
      }

      // check last time maintenance service was successfully run
      if ( config.maintenance.statusFailAfterInterval ) {

        // last maintenance task to run
        const jobName = 'check-separation-records';

        const lastMaintenance = await jobs.getRecent({
          limit: 1,
          name: jobName,
          endedSince: config.maintenance.statusFailAfterInterval
        });

        if ( lastMaintenance.error ){
          throw lastMaintenance.error;
        }

        services.maintenance = {
          status: lastMaintenance.res.rows.length > 0 ? 'pass' : 'fail',
          failAfterInterval: config.maintenance.statusFailAfterInterval
        };

        if ( lastMaintenance.res.rows.length ) {
          services.maintenance.lastRun = lastMaintenance.res.rows[0].end_time;
        } else {
          const m = await jobs.getRecent({
            limit: 1,
            name: jobName
          });
          if ( m.error ) {
            throw m.error;
          }
          services.maintenance.lastRun = m.res?.rows?.[0]?.end_time || null;
        }
      }

      // check api service used by other applications
      const auth = Buffer.from(`${config.ucdlibIamApi.user}:${config.ucdlibIamApi.key}`).toString('base64');
      const headers = {'Authorization': `Basic ${auth}`};
      const apiUrl = `http://${config.ucdlibIamApi.service}:${config.ucdlibIamApi.servicePort}/json/employees?name=healthcheck`;
      try {
        const apiResponse = await fetch(apiUrl, { headers });
        if (!apiResponse.ok) {
          const d = await apiResponse.json();
          throw new Error(`API health check failed with status ${apiResponse.status}`);
        }
        services.api = { status: 'pass' };

      } catch (e) {
        services.api = { status: 'fail' };
      }

      const overallStatus = Object.values(services).every(service => service.status === 'pass') ? 'pass' : 'fail';

      res.status(200).json({ status: overallStatus, services });
    } catch (error) {
      console.error('Health check error:', error);
      res.status(500).json({ status: 'fail', error: error.message });
    }
  });
}
