import BaseConfig from '@ucd-lib/iam-support-lib/src/utils/config.cjs';

class ScriptConfig extends BaseConfig{
  constructor(){
    super();
    const env = process.env;

    this.slack.iamSyncCacheThreshold = env.SLACK_IAM_SYNC_CACHE_THRESHOLD || '2 minutes';

    this.cron = {
      iamSync: env.CRON_IAM_SYNC || '0 8 * * *',
      discrepancyNotification: env.CRON_DISCREPANCY_NOTIFICATION || '0 9 * * 5'
    }
  }
}

export default new ScriptConfig();