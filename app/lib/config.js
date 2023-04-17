class AppConfig {
  constructor(){
    const env = process.env;
    
    this.env = env.UCDLIB_APP_ENV == 'dev' ? 'dev' : 'prod';
    this.version = env.APP_VERSION;
    this.routes = ['onboarding', 'separation', 'logout', 'permissions'];
    this.title = 'UC Davis Library Identity and Access Management';
    this.baseUrl = env.UCDLIB_BASE_URL || 'http://localhost:3000' //TODO: update me;

    this.ucdIamApi = {
      key: env.UCD_IAM_API_KEY,
      url: env.UCD_IAM_API_URL || 'https://iet-ws.ucdavis.edu/api/iam',
      version: env.UCD_IAM_API_VERSION || '1.0',
      queryLimit: env.UCD_IAM_API_LIMIT || 20
    }
    this.alma = {
      url: env.UCD_ALMA_API_URL || 'https://api-na.hosted.exlibrisgroup.com/almaws/v1/',
      key: env.UCD_ALMA_API_KEY,
      version: env.UCD_ALMA_API_VERSION || '1.0',
    }
    this.rt = {
      key: env.UCDLIB_RT_KEY,
      user: env.UCDLIB_RT_USER || 'pmanager',
      forbidWrite: env.UCDLIB_RT_FORBID_WRITE != 'false' || false,
      url: env.UCDLIB_RT_URL || 'https://rt.lib.ucdavis.edu',
      queue: env.UCDLIB_RT_QUEUE || 'test' //TODO: update when create new queue, and set local-dev env
    }

    this.keycloak = {
      url: env.UCDLIB_KEYCLOAK_URL || 'https://sandbox.auth.library.ucdavis.edu',
      realm: env.UCDLIB_KEYCLOAK_REALM || 'internal',
      clientId: env.UCDLIB_KEYCLOAK_CLIENT_ID || 'iam-client'
    }
  }
}

module.exports = new AppConfig();