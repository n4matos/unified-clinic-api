// Carregar variáveis de ambiente do arquivo .env
import 'dotenv/config';

export const config = {
  // Configurações da aplicação
  port: Number(process.env.PORT) || 3000,
  environment: process.env.NODE_ENV || 'development',

  // Configurações de logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'development',
  },

  // Configurações de segurança
  security: {
    corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  },

  // Configurações de banco de dados principal (clínicas)
  database: {
    path: process.env.DB_PATH || './data/clinic.db',
  },

  // Configurações do banco de clínicas (PostgreSQL)
  clinicsDatabase: {
    url:
      process.env.CLINICS_DATABASE_URL ||
      'postgres://user:password@localhost:5432/unified_clinic_clinics',
    poolMin: parseInt(process.env.CLINICS_DB_POOL_MIN || '2', 10),
    poolMax: parseInt(process.env.CLINICS_DB_POOL_MAX || '10', 10),
    timeout: parseInt(process.env.CLINICS_DB_TIMEOUT || '60000', 10),
  },

  // Configurações de autenticação JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },

  // Configurações de tenants (multi-tenant)
  tenants: {
    tenant1: {
      connection:
        process.env.TENANT_1_PG_CONN ||
        'postgres://user:password@localhost:5433/unified_clinic_tenant1',
    },
    tenant2: {
      connection:
        process.env.TENANT_2_MYSQL_CONN ||
        'mysql://user:password@localhost:3306/unified_clinic_mysql',
    },
  },
};

// Validação de configurações críticas
if (config.environment === 'production') {
  const requiredEnvVars = ['JWT_SECRET', 'CLINICS_DATABASE_URL'];
  const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(
      `Variáveis de ambiente obrigatórias em produção não encontradas: ${missingVars.join(', ')}`
    );
  }

  // Validar se JWT_SECRET não é o valor padrão
  if (config.jwt.secret === 'your-secret-key-change-in-production') {
    throw new Error('JWT_SECRET deve ser alterado em produção!');
  }
}
