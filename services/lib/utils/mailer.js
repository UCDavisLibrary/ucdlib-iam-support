import nodemailer from 'nodemailer';
import config from './config.js';

/**
 * @description Thin wrapper around nodemailer for sending basic SMTP email
 */
class UcdlibMailer {

  _getTransport(){
    if ( this._transport ) return this._transport;
    this._transport = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: false,
      tls: { rejectUnauthorized: false }
    });
    return this._transport;
  }

  /**
   * @description Send an email. No-ops (logs and returns) if config.smtp.enabled is false.
   * If config.smtp.recipientOverride is set, redirects the send to that address instead of `to`.
   * @param {Object} opts
   * @param {String} opts.to
   * @param {String} opts.from
   * @param {String} opts.subject
   * @param {String} opts.text
   * @returns {Object} {skipped: Boolean, reason: String} | {success: Boolean, info: Object} | {success: false, error: Object}
   */
  async send({to, from, subject, text}){
    if ( !config.smtp.enabled ) {
      console.log(`[mailer] SMTP disabled, skipping send. to=${to} subject="${subject}"`);
      return {skipped: true, reason: 'SMTP disabled'};
    }
    const recipient = config.smtp.recipientOverride || to;
    if ( config.smtp.recipientOverride ) {
      console.log(`[mailer] SMTP_RECIPIENT_OVERRIDE set, redirecting mail from ${to} to ${recipient}`);
    }
    try {
      const info = await this._getTransport().sendMail({from, to: recipient, subject, text});
      return {success: true, info};
    } catch (error) {
      console.error('[mailer] send error', error);
      return {success: false, error};
    }
  }
}

export default new UcdlibMailer();
