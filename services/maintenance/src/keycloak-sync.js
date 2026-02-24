import models from '#models';
import config from "#lib/utils/config.js";

const keycloakClient = models.keycloakAdmin;

function KeycloakSyncError(error) {
  this.error = error;
  this.message = "Error when syncing employees with keycloak.";
  }

/**
 * @description Syncs all employees from local db with keycloak
 *  Note, you need to be on staff vpn or on itis network to run this script
 * @param {Boolean} saveToDB - if true, will save a record of the run to the jobs table
 */
export const run = async (saveToDB) => {
  let thisJob;
  try {
    console.log(`Syncing to keycloak: ${config.keycloakAdmin.baseUrl}/realms/${config.keycloakAdmin.realmName}`);
    if ( saveToDB ) {
      const r = await models.jobs.start('keycloak-sync');
      if ( r.job ) thisJob = r.job;
    }
    keycloakClient.resetState(); // does cron job remember state between runs?
    await keycloakClient.init({...config.keycloakAdmin, refreshInterval: 58000});
    await keycloakClient.syncAll({
      createUsers: false,
      removeGroups: false,
    });

    if ( thisJob ) {
      for (const log of keycloakClient.logs ) {
        if ( !log.actionTaken ) continue;
        await thisJob.log(log);
      }
      thisJob.end( keycloakClient.logSummary() );
    }

  } catch (error) {
    if ( thisJob ) {
      thisJob.end({error: error.message}, false);
    }
    throw new KeycloakSyncError(error);
  } finally {
    keycloakClient.printLogs();
    keycloakClient.printLogSummary();
    keycloakClient.resetState();
  }
}
