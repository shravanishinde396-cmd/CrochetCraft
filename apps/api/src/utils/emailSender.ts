import { resend, transporter, EMAIL_FROM, EMAIL_FROM_NAME } from '../config/email';
import logger from './logger';

interface SendMailParams {
  to: string;
  subject: string;
  html: string;
}

export const sendMail = async ({ to, subject, html }: SendMailParams) => {
  let resendFailed = false;

  if (resend) {
    try {
      const { data, error } = await resend.emails.send({
        from: `${EMAIL_FROM_NAME} <${EMAIL_FROM}>`,
        to: [to],
        subject,
        html,
      });
      if (error) {
        throw error;
      }
      logger.info(`Email sent via Resend to ${to}: ${subject}`);
      return data;
    } catch (error) {
      logger.warn(`Failed to send email to ${to} via Resend. Falling back to SMTP if available. Error: ${error}`);
      resendFailed = true;
    }
  }

  // If resend wasn't configured, or if resend failed, use Nodemailer SMTP
  if ((!resend || resendFailed) && transporter) {
    try {
      const info = await transporter.sendMail({
        from: `"${EMAIL_FROM_NAME}" <${process.env.SMTP_USER || EMAIL_FROM}>`,
        to,
        subject,
        html,
      });
      logger.info(`Email sent via SMTP to ${to}: ${subject}`);
      return info;
    } catch (smtpError) {
      logger.error(`Failed to send email to ${to} via SMTP fallback:`, smtpError);
      return null;
    }
  }

  if (!resend && !transporter) {
    logger.warn(`Email not sent. No email service configured. Target: ${to}, Subject: ${subject}`);
  }
  return null;
};
export default sendMail;
