const config = require('./cli-config');

class employeesCli {

  async adopt(onboardingId, options){
    console.log('Adopting employee', onboardingId, options);
    const { default: iamAdmin } = await import('@ucd-lib/iam-support-lib/src/utils/admin.js');
    const { default: pg } = await import('@ucd-lib/iam-support-lib/src/utils/pg.js');

    const adoptParams = {
      force: options.force
    };
    await iamAdmin.adoptEmployee(onboardingId, adoptParams);

    if ( options.provision ) {
      // todo: provision user account in keycloak
    }
    pg.client.end();
  }
}

module.exports = new employeesCli();