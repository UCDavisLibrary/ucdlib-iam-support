import keycloakClient from "@ucd-lib/iam-support-lib/src/utils/keycloakAdmin.js";
import config from "./config.js";

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