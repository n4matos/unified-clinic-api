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

  return app;
}
