import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

console.log('DB URL:', process.env.DATABASE_URL);
console.log('ENV path:', path.resolve(__dirname, '../../../.env'));

export const config = {
  env:  process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5000,
  db: {
    host:     process.env.DB_HOST     || 'localhost',
    port:     process.env.DB_PORT     || 5432,
    name:     process.env.DB_NAME     || 'aria_db',
    user:     process.env.DB_USER     || 'postgres',
    password: process.env.DB_PASSWORD || '',
    url:      process.env.DATABASE_URL,
  },
  jwt: {
    secret:           process.env.JWT_SECRET             || 'dev_secret',
    refreshSecret:    process.env.JWT_REFRESH_SECRET     || 'dev_refresh_secret',
    expiresIn:        process.env.JWT_EXPIRES_IN         || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey:    process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
};