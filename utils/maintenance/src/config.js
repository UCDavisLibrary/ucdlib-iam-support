class ScriptConfig{
  constructor(){
    const env = process.env;

    this.slack = {
      errorsWebhook: env.SLACK_WEBHOOK_URL_FOR_ERRORS || ''
    }
  }
}

export default new ScriptConfig();