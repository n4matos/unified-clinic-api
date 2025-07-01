import Fastify from 'fastify';
import sensible from '@fastify/sensible';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import multiTenancy from './plugins/multiTenancy';
import { getActiveTenants } from './config/tenants.config';
import authMiddleware from './middleware/auth.middleware';
import authRoutes from './routes/auth.route';
import patientRoutes from './routes/patient.route';
import errorHandler from './plugins/errorHandler';
import healthRoutes from './routes/health.route';
import knex from 'knex';

const __dirname = dirname(fileURLToPath(import.meta.url));

export async function buildApp() {
  const app = Fastify({ logger: true });

  // Initialize user database connection
  const userDb = knex({
    client: 'pg',
    connection: process.env.USERS_DATABASE_URL || 'postgres://user:password@localhost:5432/unified_clinic_users',
    pool: {
      min: 2,
      max: 10,
    },
  });

  // Decorate app with userDb
  app.decorate('userDb', userDb);

  app.register(errorHandler);
  app.register(sensible);

  await app.register(multiTenancy, {
    tenants: getActiveTenants(),
  });

  // Register public routes first
  app.register(authRoutes);
  app.register(healthRoutes);

  app.register(async (app) => {
    app.register(authMiddleware);
    app.register(patientRoutes);
  });

    

  // Close userDb connection on app close
  app.addHook('onClose', async () => {
    await userDb.destroy();
    app.log.info('User database connection closed.');
  });

  return app;
}
