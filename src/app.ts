import Fastify from 'fastify';
import sensible from '@fastify/sensible';
import autoload from '@fastify/autoload';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import multiTenancy from './plugins/multiTenancy';
import { getActiveTenants } from './config/tenants.config';

const __dirname = dirname(fileURLToPath(import.meta.url));

export function buildApp() {
  const app = Fastify({ logger: true });

  app.register(sensible);

  // Usar configuração centralizada de tenants
  app.register(multiTenancy, {
    tenants: getActiveTenants(),
  });

  app.register(autoload, { dir: join(__dirname, 'routes') });

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

  return app;
}
