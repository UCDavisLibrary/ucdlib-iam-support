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
    keycloakClient.init({...config.keycloakAdmin, refreshInterval: 58000});
    //keycloakClient.logInRealTime = true;
    //await keycloakClient.syncAll();
    await keycloakClient.syncGroups(true);
    await keycloakClient.syncGroupStructure();
    keycloakClient.printLogs(true);
    keycloakClient.printLogSummary();
    keycloakClient.resetState();
  } catch (error) {
    console.log(error); // todo: remove when done testing
    throw new KeycloakSyncError(error);
  }
}

run();