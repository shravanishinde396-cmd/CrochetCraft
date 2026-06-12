import dotenv from 'dotenv';
dotenv.config();
import { sendMail } from './utils/emailSender';

async function run() {
  console.log('Testing Brevo sending configuration...');
  const key = process.env.BREVO_API_KEY;
  if (!key) {
    console.error('ERROR: BREVO_API_KEY is not set in your .env file.');
    return;
  }
  console.log('Found BREVO_API_KEY starting with:', key.substring(0, 15) + '...');
  
  try {
    const result = await sendMail({
      to: 'shravanishinde396@gmail.com',
      subject: 'Brevo Integration Diagnostic Test',
      html: '<h1>Brevo Works!</h1><p>This is a successful test email sent via Brevo HTTP API.</p>',
    });
    console.log('sendMail response:', result);
  } catch (error) {
    console.error('sendMail threw error:', error);
  }
}

run();
