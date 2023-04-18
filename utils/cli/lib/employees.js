const config = require('./cli-config');

class employeesCli {

  /**
   * @description Adopt an employee into the Library IAM database
   * @param {String} onboardingId - Onboarding record id
   * @param {Object} options - Options object from commander
   */
  async adopt(onboardingId, options){
    console.log(`Adopting employee from onboarding record ${onboardingId} with options:`, options);
    
    const { default: iamAdmin } = await import('@ucd-lib/iam-support-lib/src/utils/admin.js');
    const { default: pg } = await import('@ucd-lib/iam-support-lib/src/utils/pg.js');
    const { UcdlibRt, UcdlibRtTicket } = await import('@ucd-lib/iam-support-lib/src/utils/rt.js');

    const forceMessage = 'Use --force to override this check.';

    const adoptParams = {
      ucdIamConfig: config.ucdIamApi,
      force: options.force,
      sendRt: options.rt,
      rtConfig: config.rt
    };
    if ( config.rt.forbidWrite ) adoptParams.sendRt = false;

    const result = await iamAdmin.adoptEmployee(onboardingId, adoptParams);
    if ( result.error ) {
      let msg = `Error adopting employee!\n${result.message}.`;
      if ( result.canForce ) msg += `\n${forceMessage}`;
      if ( result.canForce && result.forceMessage ) msg += `\n${result.forceMessage}`;
      console.error(msg);
      pg.client.end();
      return;
    }

    if ( options.provision ) {
      const kcParams = {
        keycloakConfig: {...config.keycloakAdmin, refreshInterval: 58000},
        printLogs: true
      };
      const kcResult = await iamAdmin.provisionKcAccount(result.employeeId, kcParams);
      if ( kcResult.error ) {
        await iamAdmin.deleteEmployee(result.employeeId);
        let msg = `Error provisioning keycloak account!\n${kcResult.message}.`;
        console.error(msg);
        pg.client.end();
        return;
      }
      
    }

    // comment on rt ticket
    if ( options.rt && !config.rt.forbidWrite && result.onboardingRecord.rt_ticket_id) {
      const rtClient = new UcdlibRt(config.rt);
      const ticket = new UcdlibRtTicket(false, {id: result.onboardingRecord.rt_ticket_id});
      const reply = ticket.createReply();
      reply.addSubject('Employee Record Added');
      reply.addContent('This employee was adopted into the UC Davis Library Identity and Access Management System');
      const rtResponse = await rtClient.sendCorrespondence(reply);
      if ( rtResponse.err )  {
        console.error('Error sending RT correspondence');
        console.error(rtResponse);
      }
    }

    console.log(result.message);
    console.log(`Employee adopted with id ${result.employeeId}.`);
    await pg.client.end();
  }

  async dismissRecordDiscrepancyNotifications(iamId){

    const { default: UcdlibEmployees } = await import('@ucd-lib/iam-support-lib/src/utils/employees.js');
    const { default: pg } = await import('@ucd-lib/iam-support-lib/src/utils/pg.js');
    const r = await UcdlibEmployees.dismissRecordDiscrepancyNotifications(iamId);
    await pg.client.end();
    if ( r.err) {
      console.error(`Error dismissing record discrepancy notifications\n${r.err.message}`);
      return;
    }
    console.log(`Dismissed ${r.res.rowCount} record discrepancy notifications`);
  }
}

module.exports = new employeesCli();