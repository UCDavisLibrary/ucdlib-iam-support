class BaseConfig {
  constructor(){
    const env = process.env;

    this.env = env.UCDLIB_APP_ENV == 'dev' ? 'dev' : 'prod';
    this.version = env.APP_VERSION;

    this.slack = {
      errorsWebhook: env.SLACK_WEBHOOK_URL_FOR_ERRORS || ''
    }

    this.ucdIamApi = {
      key: env.UCD_IAM_API_KEY,
      url: env.UCD_IAM_API_URL || 'https://iet-ws.ucdavis.edu/api/iam',
      version: env.UCD_IAM_API_VERSION || '1.0',
      cacheExpiration: env.UCD_IAM_API_CACHE_EXPIRATION || '12 hours'
    }

    this.keycloak = {
      url: env.UCDLIB_KEYCLOAK_URL || 'https://sandbox.auth.library.ucdavis.edu', // TODO: change to production
      realm: env.UCDLIB_KEYCLOAK_REALM || 'internal',
      clientId: env.UCDLIB_KEYCLOAK_CLIENT_ID || 'iam-client'
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

    this.rt = {
      key: env.UCDLIB_RT_KEY,
      user: env.UCDLIB_RT_USER || 'pmanager',
      forbidWrite: env.UCDLIB_RT_FORBID_WRITE != 'false' || false,
      url: env.UCDLIB_RT_URL || 'https://rt.lib.ucdavis.edu',
      queue: env.UCDLIB_RT_QUEUE || 'test', //TODO: update when create new queue, and set local-dev env
      daysSinceResolved: env.UCDLIB_RT_DAYS_SINCE_RESOLVED || 3,
    }

    this.alma = {
      url: env.UCD_ALMA_API_URL || 'https://api-na.hosted.exlibrisgroup.com/almaws/v1/',
      key: env.UCD_ALMA_API_KEY,
      version: env.UCD_ALMA_API_VERSION || '1.0',
    }
  }
}

module.exports = BaseConfig;