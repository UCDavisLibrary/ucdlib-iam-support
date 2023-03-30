class ScriptConfig{
  constructor(){
    const env = process.env;

    this.slack = {
      errorsWebhook: env.SLACK_WEBHOOK_URL_FOR_ERRORS || ''
    }

    this.ucdIamApi = {
      key: env.UCD_IAM_API_KEY,
      url: env.UCD_IAM_API_URL || 'https://iet-ws.ucdavis.edu/api/iam',
      version: env.UCD_IAM_API_VERSION || '1.0',
      cacheExpiration: env.UCD_IAM_API_CACHE_EXPIRATION || '12 hours'
    }
  }
}

export default new ScriptConfig();