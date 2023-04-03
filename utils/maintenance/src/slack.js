import { IncomingWebhook } from '@slack/webhook';
import config from './config.js';

class Slack {
  constructor() {
    if ( config.slack.errorsWebhook) {
      this.webhook = new IncomingWebhook(config.slack.errorsWebhook);
    }
  }

  /**
   * @description Send a message to the itis-error-notifications Slack channel
   * @param {String} message - The message to send
   * @param {String} appName - The name of the app to be displayed at the top of the message. Optional.
   * @param {String} appUrl - The URL of the app to be displayed at the top of the message. Optional.
   * @param {String} stack - The stack trace to send as attachment. Optional.
   */
  async sendErrorNotification(message, stack, appName, appUrl) {
    appName = appName || 'Iam Sync';
    appUrl = appUrl === undefined ? 'https://github.com/UCDavisLibrary/ucdlib-iam-support/tree/main/utils/maintenance' : appUrl;
    const u = appUrl ? true : false;
    let m = `*App/Script*: ${u ? `<${appUrl}|${appName}>` : appName}\n`
    m += `*Error*: ${message}\n`
    if ( stack ){ 
      let sm = stack;
      if ( stack.message ) sm = stack.message;
      m+= `\`\`\`${sm}\`\`\``;
    }
    if (this.webhook) {
      const payload = {
        text: m,
        mrkdwn: true
      }
      await this.webhook.send(payload);
    }
  }

  async send(text){
    if (this.webhook) {
      const payload = {
        text,
        mrkdwn: true
      }
      await this.webhook.send(payload);
    }
  }
}

export default new Slack();