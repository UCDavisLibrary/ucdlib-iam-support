import keycloakClient from "@ucd-lib/iam-support-lib/src/utils/keycloakAdmin.js";
import config from "./config.js";

function KeycloakSyncError(error) {
  this.error = error;
  this.message = "Error when syncing employees with keycloak.";
  }

export const run = async () => {
  try {
    keycloakClient.init(config.keycloakAdmin);
    keycloakClient.resetState();
    keycloakClient.logInRealTime = true;
    await keycloakClient.syncAll();
    keycloakClient.printLogSummary();
    keycloakClient.printLogs(true);
  } catch (error) {
    throw new KeycloakSyncError(error);
  }
}

run();