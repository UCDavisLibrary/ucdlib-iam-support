class CliConfig {
  constructor(){
    const env = process.env;
    
    this.env = env.UCDLIB_APP_ENV == 'dev' ? 'dev' : 'prod';
    this.version = env.APP_VERSION;

    this.ucdIamApi = {
      key: env.UCD_IAM_API_KEY,
      url: env.UCD_IAM_API_URL || 'https://iet-ws.ucdavis.edu/api/iam',
      version: env.UCD_IAM_API_VERSION || '1.0',
      queryLimit: env.UCD_IAM_API_LIMIT || 20
    }

    this.rt = {
      key: env.UCDLIB_RT_KEY,
      user: env.UCDLIB_RT_USER || 'pmanager',
      forbidWrite: env.UCDLIB_RT_FORBID_WRITE != 'false' || false,
      url: env.UCDLIB_RT_URL || 'https://rt.lib.ucdavis.edu',
      queue: env.UCDLIB_RT_QUEUE || 'test' //TODO: update when create new queue, and set local-dev env
    }

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
  
module.exports = new CliConfig();