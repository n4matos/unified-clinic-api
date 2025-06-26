import Fastify from 'fastify';
import sensible from '@fastify/sensible';
import autoload from '@fastify/autoload';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import multiTenancy from './plugins/multiTenancy.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export function buildApp() {
  const app = Fastify({ logger: true });

  app.register(sensible);

  app.register(multiTenancy, {
    tenants: [
      {
        id: 'clinic1',
        type: (process.env.DB_TYPE_CLINIC1 as 'postgres' | 'mysql') || 'postgres',
        conn: process.env.DB_CLINIC1!,
      },
      {
        id: 'clinic2',
        type: (process.env.DB_TYPE_CLINIC2 as 'postgres' | 'mysql') || 'postgres',
        conn: process.env.DB_CLINIC2!,
      },
      {
        id: 'clinic3',
        type: (process.env.DB_TYPE_CLINIC3 as 'postgres' | 'mysql') || 'postgres',
        conn: process.env.DB_CLINIC3!,
      },
      {
        id: 'clinic4',
        type: (process.env.DB_TYPE_CLINIC4 as 'postgres' | 'mysql') || 'postgres',
        conn: process.env.DB_CLINIC4!,
      },
      {
        id: 'clinic5',
        type: (process.env.DB_TYPE_CLINIC5 as 'postgres' | 'mysql') || 'postgres',
        conn: process.env.DB_CLINIC5!,
      },
      {
        id: 'clinic6',
        type: (process.env.DB_TYPE_CLINIC6 as 'postgres' | 'mysql') || 'postgres',
        conn: process.env.DB_CLINIC6!,
      },
    ],
  });

  app.register(autoload, { dir: join(__dirname, 'routes') });

  return app;
}
