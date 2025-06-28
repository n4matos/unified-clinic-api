import Fastify from 'fastify';
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

  app.setErrorHandler((error, request, reply) => {
    app.log.error({ error, request }, 'Request error');

    // Handle specific error types or provide a generic error response
    if (error.validation) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: error.message,
        validation: error.validation,
      });
    }

    if (error.statusCode) {
      return reply.status(error.statusCode).send({
        statusCode: error.statusCode,
        error: error.name || 'Error',
        message: error.message,
      });
    }

    // Generic server error
    reply.status(500).send({
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'Something went wrong',
    });
  });

  // Close userDb connection on app close
  app.addHook('onClose', async () => {
    await userDb.destroy();
    app.log.info('User database connection closed.');
  });

  return app;
}