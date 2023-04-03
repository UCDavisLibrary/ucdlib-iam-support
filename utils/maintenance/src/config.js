class ScriptConfig{
  constructor(){
    const env = process.env;

    this.slack = {
      errorsWebhook: env.SLACK_WEBHOOK_URL_FOR_ERRORS || '',
      iamSyncCacheThreshold: env.SLACK_IAM_SYNC_CACHE_THRESHOLD || '2 minutes'
    }

    this.ucdIamApi = {
      key: env.UCD_IAM_API_KEY,
      url: env.UCD_IAM_API_URL || 'https://iet-ws.ucdavis.edu/api/iam',
      version: env.UCD_IAM_API_VERSION || '1.0',
      cacheExpiration: env.UCD_IAM_API_CACHE_EXPIRATION || '12 hours'
    }

    this.cron = {
      iamSync: env.CRON_IAM_SYNC || '0 8 * * *',
      discrepancyNotification: env.CRON_DISCREPANCY_NOTIFICATION || '0 9 * * 5'
    }
  }
}

export default new ScriptConfig();