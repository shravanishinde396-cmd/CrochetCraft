import { v2 as cloudinary } from 'cloudinary';
import logger from '../utils/logger';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'placeholder_cloud',
  api_key: process.env.CLOUDINARY_API_KEY || 'placeholder_key',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'placeholder_secret',
});

logger.info('Cloudinary config loaded.');

export { cloudinary };
export default cloudinary;
