import { resend, transporter, EMAIL_FROM, EMAIL_FROM_NAME } from '../config/email';
import logger from './logger';

interface SendMailParams {
  to: string;
  subject: string;
  html: string;
}

export const sendMail = async ({ to, subject, html }: SendMailParams) => {
  try {
    if (resend) {
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
    } else if (transporter) {
      const info = await transporter.sendMail({
        from: `"${EMAIL_FROM_NAME}" <${process.env.SMTP_USER || EMAIL_FROM}>`,
        to,
        subject,
        html,
      });
      logger.info(`Email sent via SMTP to ${to}: ${subject}`);
      return info;
    } else {
      logger.warn(`Email not sent. No email service configured. Target: ${to}, Subject: ${subject}`);
      return null;
    }
  } catch (error) {
    logger.error(`Failed to send email to ${to}:`, error);
    return null;
  }
};
export default sendMail;
