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
  }
}
  
module.exports = new CliConfig();