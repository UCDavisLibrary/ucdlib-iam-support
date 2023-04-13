import * as dotenv from 'dotenv' 

class MigrationConfig{
  constructor(){
    dotenv.config();
    const env = process.env;

    this.keycloakAdmin = {
      baseUrl: env.KEYCLOAK_ADMIN_BASE_URL || 'https://sandbox.auth.library.ucdavis.edu', // TODO: change to production
      realmName: env.KEYCLOAK_ADMIN_REALM_NAME || 'internal',
      username: env.KEYCLOAK_ADMIN_USERNAME || 'sa-iam-sync',
      grantType: env.KEYCLOAK_ADMIN_GRANT_TYPE || 'password',
      clientId: env.KEYCLOAK_ADMIN_CLIENT_ID || 'admin-cli',
      password: env.KEYCLOAK_ADMIN_PASSWORD,
      casIdentityProvider: env.KEYCLOAK_ADMIN_CAS_IDENTITY_PROVIDER || 'ssodev-oidc', // TODO: change to production
      realmRoles: env.KEYCLOAK_ADMIN_REALM_ROLES || 'basic-access',
    }
  }
}

export default new MigrationConfig();