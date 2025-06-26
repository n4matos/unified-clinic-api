import fp from 'fastify-plugin';
import { Pool } from 'pg';
import { FastifyInstance, FastifyRequest } from 'fastify';

interface TenantConfig {
  id: string;
  conn: string;
}

declare module 'fastify' {
  interface FastifyRequest {
    db: Pool;
  }
}

export default fp(async (app: FastifyInstance, opts: { tenants: TenantConfig[] }) => {
  const pools = new Map<string, Pool>();

  for (const t of opts.tenants) {
    pools.set(t.id, new Pool({ connectionString: t.conn }));
    app.log.info(`Pool criado p/ clínica ${t.id}`);
  }

  app.decorateRequest('db', null as unknown as Pool);

  app.addHook('preHandler', (req, _reply, done) => {
    const clinic = req.headers['x-clinic-id'] as string | undefined;
    const pool = clinic && pools.get(clinic);
    if (!pool) return done(new Error('Clinic not found'));
    (req as any).db = pool;
    done();
  });

  app.addHook('onClose', async () => {
    for (const p of pools.values()) await p.end();
  });
}, { name: 'multiTenancy' });
