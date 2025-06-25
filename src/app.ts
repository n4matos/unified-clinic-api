import Fastify from 'fastify';
import sensible from '@fastify/sensible';
import autoload from '@fastify/autoload';

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function buildApp() {
  const app = Fastify({ logger: true });

  app.register(sensible);
  app.register(autoload, { dir: join(__dirname, 'plugins') });

  app.register(autoload, { dir: join(__dirname, 'routes') });

  return app;
}
