import Fastify, { FastifyInstance } from 'fastify';
import sensible from '@fastify/sensible';
import { randomUUID } from 'crypto';

import multiTenancy from './plugins/multiTenancy';
import errorHandler from './plugins/errorHandler';
import configDatabase from './plugins/configDatabase';

import authMiddleware from './middleware/auth.middleware';
import authRoutes from './routes/auth.route';
import healthRoutes from './routes/health.route';
import tenantRoutes from './routes/tenant.route';

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

  /* ---------- banco de configurações ---------- */
  await app.register(configDatabase);

  /* ---------- multi-tenancy ---------- */
  await app.register(multiTenancy);

  /* ---------- rotas públicas ---------- */
  app.register(authRoutes);
  app.register(healthRoutes);
  app.register(tenantRoutes); // Rotas administrativas para gerenciar tenants

  /* ---------- middleware de autenticação disponível para futuras rotas ---------- */
  app.register(authMiddleware);

  /* ---------- log de requisição ---------- */
  app.addHook('onResponse', (req, rep, done) => {
    req.log.info(
      { statusCode: rep.statusCode, resTime: `${rep.elapsedTime.toFixed(1)}ms` },
      'request completed'
    );
    done();
  });

  return app;
}
