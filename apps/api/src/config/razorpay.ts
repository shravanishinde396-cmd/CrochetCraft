import Razorpay from 'razorpay';
import logger from '../utils/logger';

let razorpay: Razorpay;

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret';

try {
  razorpay = new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
  });
  logger.info('Razorpay client initialized.');
} catch (error) {
  logger.error('Failed to initialize Razorpay client:', error);
  // Fallback placeholder object for compile safety
  razorpay = new Razorpay({
    key_id: 'dummy',
    key_secret: 'dummy',
  });
}

export { razorpay, RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET };
export default razorpay;
