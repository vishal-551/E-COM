import dotenv from 'dotenv';

dotenv.config();

const splitCsv = (value = '') => value
  .split(',')
  .map((entry) => entry.trim())
  .filter(Boolean);

export const requireEnv = (name) => {
  const value = process.env[name];
  if (!value || !String(value).trim()) {
    throw new Error(`${name} is not configured.`);
  }
  return value;
};

export const requireOneOfEnv = (names) => {
  const resolved = names.map((name) => process.env[name]).find((value) => value && String(value).trim());
  if (!resolved) {
    throw new Error(`One of ${names.join(', ')} must be configured.`);
  }
  return resolved;
};

export const getAllowedOrigins = () => {
  const urls = splitCsv(process.env.CLIENT_URLS || '');
  if (process.env.CLIENT_URL) urls.push(process.env.CLIENT_URL.trim());
  return [...new Set(urls.filter(Boolean))];
};

export const validateRuntimeEnv = () => {
  const errors = [];
  const required = ['MONGO_URI', 'JWT_SECRET', 'CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];

  for (const key of required) {
    if (!process.env[key] || !String(process.env[key]).trim()) {
      errors.push(`${key} is missing`);
    }
  }

  const allowedOrigins = getAllowedOrigins();
  if (!allowedOrigins.length) {
    errors.push('Set CLIENT_URL or CLIENT_URLS so CORS can allow your frontend domain');
  }

  if (process.env.NODE_ENV === 'production') {
    const jwtSecret = process.env.JWT_SECRET || '';
    if (jwtSecret.length < 32) {
      errors.push('JWT_SECRET must be at least 32 characters in production');
    }
  }

  return { errors, allowedOrigins };
};
