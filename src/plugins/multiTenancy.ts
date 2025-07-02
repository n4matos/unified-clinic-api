import fp from 'fastify-plugin';
import knex from 'knex';
import { FastifyInstance } from 'fastify';
import { DbPool } from '../types/db.types';

interface TenantConfig {
  id: string;
  connEnv: string;
  type: 'postgres' | 'mysql';
}

export default fp(
  async (app: FastifyInstance, opts: { tenants: TenantConfig[] }) => {
    const pools = new Map<string, DbPool>();
    const failedTenantInitializations: string[] = [];

    for (const t of opts.tenants) {
      const conn = process.env[t.connEnv];
      if (!conn) {
        app.log.warn(`⚠️  ${t.id}: env ${t.connEnv} not set`);
        continue;
      }

      const pool = knex({
        client: t.type === 'postgres' ? 'pg' : 'mysql2',
        connection: conn,
        pool: { min: 2, max: 10 },
      }) as DbPool;
      pool.type = t.type;

      try {
        await pool.raw('SELECT 1');
        pools.set(t.id, pool);
        app.log.info(`✅ DB ready - clinic ${t.id}`);
      } catch (err) {
        app.log.error({ err }, `❌ DB fail - clinic ${t.id}`);
        failedTenantInitializations.push(t.id);
        await pool.destroy();
      }
    }

    app.decorate('getDbPool', (clinicId: string) => {
      const pool = pools.get(clinicId);
      if (!pool) throw app.httpErrors.notFound(`Clínica '${clinicId}' não encontrada`);
      return pool;
    });

    app.decorate('failedTenantInitializations', failedTenantInitializations);

    app.addHook('onClose', async () => {
      await Promise.allSettled(Array.from(pools.values()).map((p) => p.destroy()));
      app.log.info('All clinic pools closed');
    });
  },
  { name: 'multiTenancy' },
);
