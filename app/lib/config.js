class AppConfig {
  constructor(){
    const env = process.env;
    
    this.env = env.UCDLIB_APP_ENV == 'dev' ? 'dev' : 'prod';
    this.version = env.APP_VERSION;
    this.routes = ['foo', 'bar'];
    this.title = 'UC Davis Library Identity and Access Management';

    this.ucdIamApi = {
      key: env.UCD_IAM_API_KEY,
      url: env.UCD_IAM_API_URL || 'https://iet-ws.ucdavis.edu/api/iam',
      version: env.UCD_IAM_API_VERSION || '1.0'
    }
  }
}

module.exports = new AppConfig();