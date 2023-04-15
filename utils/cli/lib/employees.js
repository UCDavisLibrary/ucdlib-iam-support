const config = require('./cli-config');

class employeesCli {

  async adopt(onboardingId, options){
    console.log('Adopting employee', onboardingId, options);
    
    const { default: iamAdmin } = await import('@ucd-lib/iam-support-lib/src/utils/admin.js');
    const { default: pg } = await import('@ucd-lib/iam-support-lib/src/utils/pg.js');

    const forceMessage = 'Use --force to override this check.';

    const adoptParams = {
      ucdIamConfig: config.ucdIamApi,
      force: options.force
    };
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
      // todo: provision user account in keycloak
      // if failure, remove employee from iam db
    }

    console.log(result.message);
    console.log(`Employee adopted with id ${result.employeeId}.`);
    pg.client.end();
  }
}

module.exports = new employeesCli();