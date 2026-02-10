import corkBuild from './corkBuild.js';

class Config {
  constructor(){

    this.env = process.env.UCDLIB_APP_ENV == 'dev' ? 'dev' : 'prod';
    this.version = corkBuild.version;

    this.slack = {
      errorsWebhook: this.getEnv('SLACK_WEBHOOK_URL_FOR_ERRORS', ''),
      iamSyncCacheThreshold: this.getEnv('SLACK_IAM_SYNC_CACHE_THRESHOLD', '2 minutes')
    };

    this.ucdIamApi = {
      key: this.getEnv('UCD_IAM_API_KEY'),
      url: this.getEnv('UCD_IAM_API_URL', 'https://iet-ws.ucdavis.edu/api/iam'),
      version: this.getEnv('UCD_IAM_API_VERSION', '1.0'),
      cacheExpiration: this.getEnv('UCD_IAM_API_CACHE_EXPIRATION', '12 hours'),
      queryLimit: this.getEnv('UCD_IAM_QUERY_LIMIT', 15),
      maxConcurrentRequests: this.getEnv('UCD_IAM_MAX_CONCURRENT_REQUESTS', 5)
    };

    this.ucdlibIamApi = {
      key: this.getEnv('UCDLIB_IAM_API_KEY'),
      user: this.getEnv('UCDLIB_IAM_API_USER'),
      service: this.getEnv('UCDLIB_IAM_API_SERVICE', 'api'),
      servicePort: this.getEnv('UCDLIB_IAM_API_SERVICE_PORT', '3000')
    };

    this.ldap = {
      key: this.getEnv('UCD_LDAP_KEY'),
      user: this.getEnv('UCD_LDAP_USER', 'uid=libproxy,ou=Special Users,dc=ucdavis,dc=edu'),
      base: this.getEnv('UCD_LDAP_BASE', 'ou=People,dc=ucdavis,dc=edu'),
      port: this.getEnv('UCD_LDAP_PORT', '636'),
      server: this.getEnv('UCD_LDAP_SERVER_NAME', 'ldaps://ldap.ucdavis.edu'),
    };

    this.keycloak = {
      url: this.getEnv('UCDLIB_KEYCLOAK_URL', 'https://auth.library.ucdavis.edu'),
      realm: this.getEnv('UCDLIB_KEYCLOAK_REALM', 'internal'),
      clientId: this.getEnv('UCDLIB_KEYCLOAK_CLIENT_ID', 'iam-client'),
      apiClientId: this.getEnv('UCDLIB_KEYCLOAK_API_CLIENT_ID', 'iam-api')
    };

    this.keycloakAdmin = {
      baseUrl: this.getEnv('KEYCLOAK_ADMIN_BASE_URL', 'https://auth.library.ucdavis.edu'),
      realmName: this.getEnv('KEYCLOAK_ADMIN_REALM_NAME', 'internal'),
      username: this.getEnv('KEYCLOAK_ADMIN_USERNAME', 'sa-iam-sync'),
      grantType: this.getEnv('KEYCLOAK_ADMIN_GRANT_TYPE', 'password'),
      clientId: this.getEnv('KEYCLOAK_ADMIN_CLIENT_ID', 'admin-cli'),
      password: this.getEnv('KEYCLOAK_ADMIN_PASSWORD'),
      casIdentityProvider: this.getEnv('KEYCLOAK_ADMIN_CAS_IDENTITY_PROVIDER', 'cas-oidc'),
      realmRoles: this.getEnv('KEYCLOAK_ADMIN_REALM_ROLES', 'basic-access')
    };

    this.rt = {
      key: this.getEnv('UCDLIB_RT_KEY'),
      user: this.getEnv('UCDLIB_RT_USER', ''),
      forbidWrite: this.getEnv('UCDLIB_RT_FORBID_WRITE', false),
      forbidCc: this.getEnv('UCDLIB_RT_FORBID_CC', false),
      url: this.getEnv('UCDLIB_RT_URL', 'https://rt.lib.ucdavis.edu'),
      queue: this.getEnv('UCDLIB_RT_QUEUE', 'Sysadmin'),
      facilitiesQueue: this.getEnv('UCDLIB_RT_FACILITIES_QUEUE', 'facilities'),
      daysSinceResolved: this.getEnv('UCDLIB_RT_DAYS_SINCE_RESOLVED', 3)
    };

    this.alma = {
      url: this.getEnv('UCD_ALMA_API_URL', 'https://api-na.hosted.exlibrisgroup.com/almaws/v1/'),
      key: this.getEnv('UCD_ALMA_API_KEY'),
      version: this.getEnv('UCD_ALMA_API_VERSION', '1.0'),
      queryLimit: this.getEnv('UCD_ALMA_QUERY_LIMIT', 15),
      maxConcurrentRequests: this.getEnv('UCD_ALMA_MAX_CONCURRENT_REQUESTS', 5)
    };

    this.sftp = {
      user: this.getEnv('ORGCHART_SFTP_USERNAME', 'orgchart'),
      password: this.getEnv('ORGCHART_SFTP_PASSWORD', ''),
      server: this.getEnv('ORGCHART_SFTP_SERVER', 'bnl.library.ucdavis.edu'),
      filepath: this.getEnv('ORGCHART_SFTP_FILEPATH', '/var/www/vhost/files.library.ucdavis.edu/htdocs/orgchart')
    };

    this.logger = {
      logLevel: this.getEnv('APP_LOGGER_LOG_LEVEL', 'info'),
      logLevels: {},
      disableCallerInfo: this.getEnv('APP_LOGGER_DISABLE_CALLER_INFO', false),
      reportErrors: {
        enabled: this.getEnv('APP_REPORT_ERRORS_ENABLED', false),
        url: this.getEnv('APP_REPORT_ERRORS_URL', ''),
        method: this.getEnv('APP_REPORT_ERRORS_METHOD', 'POST'),
        key: this.getEnv('APP_REPORT_ERRORS_KEY', ''),
        headers: {},
        sourceMapExtension: this.getEnv('APP_REPORT_ERRORS_SOURCE_MAP_EXTENSION', '.map'),
        customAttributes: {appOwner: 'itis', appName: 'iam-support-app'}
      }
    };

    this.app = {
      routes: ['onboarding', 'separation', 'logout', 'permissions', 'orgchart', 'emupdate', 'patron', 'tools'],
      title: 'UC Davis Library Identity and Access Management',
      baseUrl: this.getEnv('UCDLIB_BASE_URL', 'https://iam.staff.library.ucdavis.edu'),
      bundleName: this.getEnv('UCDLIB_APP_BUNDLE_NAME', 'ucdlib-iam-support.js'),
      stylesheetName: this.getEnv('UCDLIB_APP_STYLESHEET_NAME', 'ucdlib-iam-support.css'),
      bundleVersion: this.env == 'dev' ? (new Date()).toISOString() : this.version
    };

    this.backup = {
      tableName: this.getEnv('BACKUP_LOG_TABLE'),
      statusFailAfterInterval: this.getEnv('BACKUP_LOG_STATUS_FAIL_AFTER_INTERVAL', '2 days')
    };

    this.maintenance = {
      statusFailAfterInterval: this.getEnv('MAINTENANCE_STATUS_FAIL_AFTER_INTERVAL', '2 days')
    };

    this.api = {
      prefix: this.getEnv('UCDLIB_API_API_PREFIX', '/json'),
      hostPort: this.getEnv('UCDLIB_API_HOST_PORT', '')
    };

    this.cron = {
      iamSync: this.getEnv('CRON_IAM_SYNC', '0 8 * * *'),
      discrepancyNotification: this.getEnv('CRON_DISCREPANCY_NOTIFICATION', '0 9 * * 5')
    }
  }

  /**
   * @description Get an environment variable.  If the variable is not set, return the default value.
   * @param {String} name - The name of the environment variable.
   * @param {*} defaultValue - The default value to return if the environment variable is not set.
   * @param {Object} opts - Options object.
   * @param {Boolean} opts.parseJson - If true, parse the environment variable as JSON.
   * @param {Boolean} opts.errorIfMissing - Throws an error if the environment variable is not set.
   * @returns
   */
  getEnv(name, defaultValue, opts={}) {
    const { errorIfMissing=false, parseJson=false, splitString=false } = opts;
    let value = process?.env?.[name];
    if (value === undefined || value === null) {
      if (errorIfMissing && defaultValue === undefined) {
        throw new Error(`Environment variable ${name} is not set`);
      }
      return defaultValue;
    }

    if ( value?.toLowerCase?.() === 'false' ) {
      value = false;
    } else if ( value?.toLowerCase?.() === 'true' ) {
      value = true;
    }
    if ( splitString && typeof value === 'string' ) {
      value = value.split(',').map(s => s.trim());
    } else if (parseJson) {
      try {
        value = JSON.parse(value);
      } catch (e) {
        throw new Error(`Environment variable ${name} is not valid JSON`);
      }
    }
    return value;

  }
}

export default new Config();
