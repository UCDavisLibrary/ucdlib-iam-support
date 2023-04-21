class BaseConfig {
  constructor(){

    this.env = process.env.UCDLIB_APP_ENV == 'dev' ? 'dev' : 'prod';
    this.version = this.getEnv('APP_VERSION', '0.0.0');

    this.slack = {
      errorsWebhook: this.getEnv('SLACK_WEBHOOK_URL_FOR_ERRORS', '')
    }

    this.ucdIamApi = {
      key: this.getEnv('UCD_IAM_API_KEY'),
      url: this.getEnv('UCD_IAM_API_URL', 'https://iet-ws.ucdavis.edu/api/iam'),
      version: this.getEnv('UCD_IAM_API_VERSION', '1.0'),
      cacheExpiration: this.getEnv('UCD_IAM_API_CACHE_EXPIRATION', '12 hours')
    }

    this.keycloak = {
      url: this.getEnv('UCDLIB_KEYCLOAK_URL', 'https://sandbox.auth.library.ucdavis.edu'), // TODO: change to production
      realm: this.getEnv('UCDLIB_KEYCLOAK_REALM', 'internal'),
      clientId: this.getEnv('UCDLIB_KEYCLOAK_CLIENT_ID', 'iam-client'),
    }

    this.keycloakAdmin = {
      baseUrl: this.getEnv('KEYCLOAK_ADMIN_BASE_URL', 'https://sandbox.auth.library.ucdavis.edu'), // TODO: change to production
      realmName: this.getEnv('KEYCLOAK_ADMIN_REALM_NAME', 'internal'),
      username: this.getEnv('KEYCLOAK_ADMIN_USERNAME', 'sa-iam-sync'),
      grantType: this.getEnv('KEYCLOAK_ADMIN_GRANT_TYPE', 'password'),
      clientId: this.getEnv('KEYCLOAK_ADMIN_CLIENT_ID', 'admin-cli'),
      password: this.getEnv('KEYCLOAK_ADMIN_PASSWORD'),
      casIdentityProvider: this.getEnv('KEYCLOAK_ADMIN_CAS_IDENTITY_PROVIDER', 'ssodev-oidc'), // TODO: change to production
      realmRoles: this.getEnv('KEYCLOAK_ADMIN_REALM_ROLES', 'basic-access'),
    }

    this.rt = {
      key: this.getEnv('UCDLIB_RT_KEY'),
      user: this.getEnv('UCDLIB_RT_USER', 'pmanager'),
      forbidWrite: this.getEnv('UCDLIB_RT_FORBID_WRITE', false),
      forbidCc: this.getEnv('UCDLIB_RT_FORBID_CC', false),
      url: this.getEnv('UCDLIB_RT_URL', 'https://rt.lib.ucdavis.edu'),
      queue: this.getEnv('UCDLIB_RT_QUEUE', 'test'), //TODO: update when create new queue, and set local-dev env
      facilitiesQueue: this.getEnv('UCDLIB_RT_FACILITIES_QUEUE', 'facilities'),
      daysSinceResolved: this.getEnv('UCDLIB_RT_DAYS_SINCE_RESOLVED', 3)
    }

    this.alma = {
      url: this.getEnv('UCD_ALMA_API_URL', 'https://api-na.hosted.exlibrisgroup.com/almaws/v1/'),
      key: this.getEnv('UCD_ALMA_API_KEY'),
      version: this.getEnv('UCD_ALMA_API_VERSION', '1.0')
    }
  }

  getEnv(name, defaultValue=false){
    let v;
    const env = process.env[name];
    if ( env ) {
      if ( env.toLowerCase() == 'true' ) return true;
      if ( env.toLowerCase() == 'false' ) return false;
      return env;
    }
    return defaultValue;
  }
}

module.exports = BaseConfig;