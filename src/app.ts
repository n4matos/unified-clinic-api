import Fastify from 'fastify';
import sensible from '@fastify/sensible';
import autoload from '@fastify/autoload';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export function buildApp() {
  const app = Fastify({ logger: true });

  app.register(sensible);

  // Autoload plugins e rotas; dependencies resolvem a ordem
  app.register(autoload, { dir: join(__dirname, 'plugins') });
  app.register(autoload, { dir: join(__dirname, 'routes') });

  return app;
}
