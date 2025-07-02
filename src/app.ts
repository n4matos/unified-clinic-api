import Fastify, { FastifyInstance } from 'fastify';
import sensible from '@fastify/sensible';
import { randomUUID } from 'crypto';
import knex from 'knex';

import multiTenancy from './plugins/multiTenancy';
import errorHandler from './plugins/errorHandler';

import { getActiveTenants } from './config/tenants.config';
import authMiddleware from './middleware/auth.middleware';
import authRoutes from './routes/auth.route';
import patientRoutes from './routes/patient.route';
import healthRoutes from './routes/health.route';

export async function buildApp(): Promise<FastifyInstance> {
  const isProd = process.env.NODE_ENV === 'production';

  const app = Fastify({
    /* ---------- logger ---------- */
    logger: isProd
      ? { level: 'info', base: undefined, timestamp: true }
      : {
          level: 'debug',
          transport: {
            target: 'pino-pretty',
            options: { colorize: true, translateTime: 'HH:MM:ss', ignore: 'pid,hostname' },
          },
        },
    genReqId: () => randomUUID(),
  });

  /* ---------- plugins comuns ---------- */
  app.register(errorHandler);
  app.register(sensible);

  /* ---------- DB de usuários ---------- */
  const userDb = knex({
    client: 'pg',
    connection:
      process.env.USERS_DATABASE_URL ??
      'postgres://user:password@localhost:5432/unified_clinic_users',
    pool: { min: 2, max: 10 },
  });
  app.decorate('userDb', userDb);

  /* ---------- multi-tenancy ---------- */
  await app.register(multiTenancy, { tenants: getActiveTenants() });

  /* ---------- rotas públicas ---------- */
  app.register(authRoutes);
  app.register(healthRoutes);

  /* ---------- rotas autenticadas ---------- */
  app.register(async (api) => {
    api.register(authMiddleware);
    api.register(patientRoutes);
  });

  /* ---------- log de requisição ---------- */
  app.addHook('onResponse', (req, rep, done) => {
    req.log.info(
      { statusCode: rep.statusCode, resTime: `${rep.elapsedTime.toFixed(1)}ms` },
      'request completed',
    );
    done();
  });

  /* ---------- shutdown ---------- */
  app.addHook('onClose', async () => {
    await userDb.destroy();
    app.log.info('User DB closed');
  });

  return app;
}
