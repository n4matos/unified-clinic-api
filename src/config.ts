export const config = {
  port: Number(process.env.PORT) || 3000,
  environment: process.env.NODE_ENV || 'development',
  database: {
    path: process.env.DB_PATH || './data/clinic.db',
  },
  userDatabase: {
    url:
      process.env.CLINICS_DATABASE_URL ||
      'postgres://user:password@localhost:5432/unified_clinic_clinics',
    poolMin: parseInt(process.env.CLINICS_DB_POOL_MIN || '2', 10),
    poolMax: parseInt(process.env.CLINICS_DB_POOL_MAX || '10', 10),
    timeout: parseInt(process.env.CLINICS_DB_TIMEOUT || '60000', 10),
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
};
