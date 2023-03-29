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
   * @param {String} stack - The stack trace to send as attachment. Optional.
   */
  async sendErrorNotification(message, stack) {
    if (this.webhook) {
      const payload = {
        text: message,
        mrkdwn: true
      }
      if (stack) {
        payload.attachments = [
          {
            color: 'danger',
            text: stack,
          },
        ]
      }
      await this.webhook.send(payload);
    }
  }
}

export default new Slack();