export const config = {
  port: Number(process.env.PORT) || 3000,
  environment: process.env.NODE_ENV || 'development',
  database: {
    path: process.env.DB_PATH || './data/clinic.db',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
};
