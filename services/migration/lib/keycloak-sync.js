import models from '#models';
import config from "#lib/utils/config.js";

const keycloakClient = models.keycloakAdmin;

const run = async () => {
  await keycloakClient.init({...config.keycloakAdmin, refreshInterval: 58000});
  await keycloakClient.syncAll({
    createUsers: true,
    removeGroups: true,
  });
  keycloakClient.printLogs(true);
  keycloakClient.printLogSummary();
  keycloakClient.resetState();
}

run();