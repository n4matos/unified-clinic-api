import Fastify, { FastifyError } from 'fastify';
import sensible from '@fastify/sensible';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import multiTenancy from './plugins/multiTenancy';
import { getActiveTenants } from './config/tenants.config';
import authMiddleware from './middleware/auth.middleware';
import authRoutes from './routes/auth.route';
import patientRoutes from './routes/patient.route';
import healthRoutes from './routes/health.route';
import knex from 'knex';

const __dirname = dirname(fileURLToPath(import.meta.url));

export function buildApp() {
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

  app.register(sensible);

  // Register public routes first
  app.register(authRoutes);
  app.register(healthRoutes);

  // Register authentication middleware and then protected routes
  app.register(async (protectedApp) => {
    protectedApp.register(authMiddleware);

    protectedApp.register(multiTenancy, {
      tenants: getActiveTenants(),
    });

    protectedApp.register(patientRoutes);
  });

  app.setErrorHandler((error: FastifyError, request, reply) => {
    app.log.error({ error, request }, 'Request error');

    let statusCode = error.statusCode || 500;
    let errorMessage = error.message || 'Something went wrong';
    let errorName = error.name || 'Error';
    let validation: any = undefined;

    if (error.validation) {
      statusCode = 400;
      errorName = 'Bad Request';
      errorMessage = 'Validation Error';
      validation = error.validation;
    } else if (statusCode >= 500 && process.env.NODE_ENV === 'production') {
      // Hide specific 5xx error messages in production
      errorMessage = 'Internal Server Error';
    }

    reply.status(statusCode).send({
      statusCode,
      error: errorName,
      message: errorMessage,
      ...(validation && { validation }),
    });
  });

  // Close userDb connection on app close
  app.addHook('onClose', async () => {
    await userDb.destroy();
    app.log.info('User database connection closed.');
  });

  return app;
}
