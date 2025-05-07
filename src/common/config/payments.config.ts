import { registerAs } from '@nestjs/config';

export default registerAs('paypal', () => ({
  clientId: process.env.PAYPAL_CLIENT_ID,
  secret: process.env.PAYPAL_SECRET,
  environment: process.env.PAYPAL_ENVIRONMENT || 'sandbox',
  apiUrl: process.env.PAYPAL_API_URL || 'https://api-m.sandbox.paypal.com',
  webhookId: process.env.PAYPAL_WEBHOOK_ID,
}));
