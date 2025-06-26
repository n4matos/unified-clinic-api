import Fastify from 'fastify';
import sensible from '@fastify/sensible';
import autoload from '@fastify/autoload';
import { join } from 'path';

export function buildApp() {
  const app = Fastify({ logger: true });

  // Register plugins
  app.register(sensible);
  app.register(autoload, { dir: join(__dirname, 'plugins') });

  // Register routes
  app.register(autoload, { dir: join(__dirname, 'routes') });

  return app;
}
