class AppConfig {
  constructor(){
    const env = process.env;
    
    this.env = env.UCDLIB_APP_ENV == 'dev' ? 'dev' : 'prod';
    this.version = env.APP_VERSION;
    this.routes = ['onboarding', 'separation'];
    this.title = 'UC Davis Library Identity and Access Management';

    this.ucdIamApi = {
      key: env.UCD_IAM_API_KEY,
      url: env.UCD_IAM_API_URL || 'https://iet-ws.ucdavis.edu/api/iam',
      version: env.UCD_IAM_API_VERSION || '1.0',
      queryLimit: env.UCD_IAM_API_LIMIT || 20
    }

    this.rt = {
      key: env.UCDLIB_RT_KEY,
      forbidWrite: env.UCDLIB_RT_FORBID_WRITE || false,
      url: env.UCDLIB_RT_URL || 'https://rt.lib.ucdavis.edu',
      queue: env.UCDLIB_RT_QUEUE || 'webdev'
    }
  }
}

module.exports = new AppConfig();