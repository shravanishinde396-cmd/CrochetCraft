import { resend, transporter, EMAIL_FROM, EMAIL_FROM_NAME } from '../config/email';
import { prisma } from '../config/database';
import logger from './logger';

interface SendMailParams {
  to: string;
  subject: string;
  html: string;
}

export const sendMail = async ({ to, subject, html }: SendMailParams) => {
  let resendFailed = false;
  const db = prisma as any;

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
      
      await db.emailLog.create({
        data: { to, subject, service: 'RESEND', status: 'SUCCESS' }
      }).catch((dbErr: any) => logger.error('Failed to write email log:', dbErr));

      return data;
    } catch (error: any) {
      const errMsg = error?.message || JSON.stringify(error) || String(error);
      
      // If it failed, try to fallback to onboarding@resend.dev
      if (EMAIL_FROM !== 'onboarding@resend.dev') {
        try {
          logger.info(`Retrying Resend with onboarding@resend.dev for ${to}...`);
          const { data, error: retryError } = await resend.emails.send({
            from: `${EMAIL_FROM_NAME} <onboarding@resend.dev>`,
            to: [to],
            subject,
            html,
          });
          if (retryError) {
            throw retryError;
          }
          logger.info(`Email sent via Resend (onboarding fallback) to ${to}: ${subject}`);
          
          await db.emailLog.create({
            data: { to, subject, service: 'RESEND_FALLBACK', status: 'SUCCESS' }
          }).catch((dbErr: any) => logger.error('Failed to write email log:', dbErr));

          return data;
        } catch (retryErr: any) {
          const retryErrMsg = retryErr?.message || JSON.stringify(retryErr) || String(retryErr);
          logger.warn(`Failed to send email to ${to} via Resend onboarding retry: ${retryErrMsg}`);
        }
      }

      logger.warn(`Failed to send email to ${to} via Resend. Falling back to SMTP if available. Error: ${errMsg}`);
      
      await db.emailLog.create({
        data: { to, subject, service: 'RESEND', status: 'FAILED', error: errMsg }
      }).catch((dbErr: any) => logger.error('Failed to write email log:', dbErr));

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

      await db.emailLog.create({
        data: { to, subject, service: 'SMTP', status: 'SUCCESS' }
      }).catch((dbErr: any) => logger.error('Failed to write email log:', dbErr));

      return info;
    } catch (smtpError: any) {
      const errMsg = smtpError?.message || JSON.stringify(smtpError) || String(smtpError);
      logger.error(`Failed to send email to ${to} via SMTP fallback:`, smtpError);

      await db.emailLog.create({
        data: { to, subject, service: 'SMTP', status: 'FAILED', error: errMsg }
      }).catch((dbErr: any) => logger.error('Failed to write email log:', dbErr));

      return null;
    }
  }

  if (!resend && !transporter) {
    logger.warn(`Email not sent. No email service configured. Target: ${to}, Subject: ${subject}`);
    await db.emailLog.create({
      data: { to, subject, service: 'NONE', status: 'FAILED', error: 'No email service configured' }
    }).catch((dbErr: any) => logger.error('Failed to write email log:', dbErr));
  }
  return null;
};
export default sendMail;
