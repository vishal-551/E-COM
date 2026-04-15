import dotenv from 'dotenv';

dotenv.config();

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
