import keycloakClient from "@ucd-lib/iam-support-lib/src/utils/keycloakAdmin.js";
import config from "./config.js";

function KeycloakSyncError(error) {
  this.error = error;
  this.message = "Error when syncing employees with keycloak.";
  }

// you need to be on staff vpn or on itis network to run this script 
export const run = async () => {
  try {
    keycloakClient.resetState(); // does cron job remember state between runs?
    await keycloakClient.init({...config.keycloakAdmin, refreshInterval: 58000});
    await keycloakClient.syncAll({
      createUsers: false,
      removeGroups: false,
    });

  } catch (error) {
    throw new KeycloakSyncError(error);
  } finally {
    keycloakClient.printLogs();
    keycloakClient.printLogSummary();
    keycloakClient.resetState();
  }
}