import { Resend } from 'resend';
import nodemailer from 'nodemailer';
import logger from '../utils/logger';

let resend: Resend | null = null;
let transporter: any = null;

const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@crochetcraftpro.com';
const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || 'CrochetCraft Pro';

if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.startsWith('re_')) {
  resend = new Resend(process.env.RESEND_API_KEY);
  logger.info('Resend email service configured.');
}

if (process.env.SMTP_USER && process.env.SMTP_PASS) {
  const smtpPort = Number(process.env.SMTP_PORT) || 465;
  transporter = nodemailer.createTransport({
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
  logger.info('Nodemailer SMTP pooled transport configured.');
}

const ADMIN_EMAIL = process.env.ADMIN_EMAIL && process.env.ADMIN_EMAIL !== 'admin@crochetcraftpro.com'
  ? process.env.ADMIN_EMAIL
  : (process.env.SMTP_USER || 'admin@crochetcraftpro.com');

export { resend, transporter, EMAIL_FROM, EMAIL_FROM_NAME, ADMIN_EMAIL };
