import fp from 'fastify-plugin';
import knex, { Knex } from 'knex';
import { FastifyInstance } from 'fastify';
import { DbPool } from '../types/db.types.js';

interface TenantConfig {
  id: string;
  conn: string;
  type: 'postgres' | 'mysql';
}

export default fp(
  async (app: FastifyInstance, opts: { tenants: TenantConfig[] }) => {
    const pools = new Map<string, DbPool>();
    const initErrors: string[] = [];

    // Função para testar conexão
    async function testConnection(pool: DbPool, clinicId: string): Promise<boolean> {
      try {
        await pool.raw('SELECT 1');
        return true;
      } catch (error) {
        app.log.error({ err: error }, `Connection test failed for clinic ${clinicId}`);
        return false;
      }
    }

    // Inicializar pools com validação
    for (const t of opts.tenants) {
      try {
        let pool: DbPool;

        if (t.type === 'postgres') {
          pool = knex({
            client: 'pg',
            connection: t.conn,
            pool: {
              min: 2,
              max: 10,
            },
          }) as DbPool;
          pool.type = 'postgres';
        } else if (t.type === 'mysql') {
          pool = knex({
            client: 'mysql2',
            connection: t.conn,
            pool: {
              min: 2,
              max: 10,
            },
          }) as DbPool;
          pool.type = 'mysql';
        } else {
          throw new Error(`Unknown DB type for clinic ${t.id}`);
        }

        // Testar conexão
        const isConnected = await testConnection(pool, t.id);
        if (!isConnected) {
          initErrors.push(`Failed to connect to database for clinic ${t.id}`);
          await pool.destroy(); // Use destroy for Knex
          continue;
        }

        pools.set(t.id, pool);
        app.log.info(`✅ Pool criado e testado para clínica ${t.id} (${t.type})`);
      } catch (error) {
        const errorMsg = `Failed to initialize pool for clinic ${t.id}: ${error}`;
        initErrors.push(errorMsg);
        app.log.error(errorMsg);
      }
    }

    // Verificar se pelo menos uma clínica foi inicializada
    if (pools.size === 0) {
      throw new Error(`No database pools could be initialized. Errors: ${initErrors.join('; ')}`);
    }

    if (initErrors.length > 0) {
      app.log.warn(`Some clinics failed to initialize: ${initErrors.join('; ')}`);
    }

    app.log.info(
      `Multi-tenancy initialized with ${pools.size} clinic(s): ${Array.from(pools.keys()).join(', ')}`,
    );

    // Endpoint para verificar status das clínicas
    app.get('/health/clinics', async (request, reply) => {
      const clinicsStatus = await Promise.allSettled(
        Array.from(pools.entries()).map(async ([clinicId, pool]) => {
          try {
            await pool.raw('SELECT 1');
            return {
              clinicId,
              status: 'healthy',
              type: opts.tenants.find((t) => t.id === clinicId)?.type,
            };
          } catch (error) {
            return { clinicId, status: 'unhealthy', error: (error as Error).message };
          }
        }),
      );

      const results = clinicsStatus.map((result) =>
        result.status === 'fulfilled' ? result.value : result.reason,
      );

      const healthyCount = results.filter((r) => r.status === 'healthy').length;
      const overallStatus = healthyCount === results.length ? 'healthy' : 'degraded';

      return reply.send({
        status: overallStatus,
        totalClinics: results.length,
        healthyClinics: healthyCount,
        clinics: results,
      });
    });

    app.decorateRequest('db', null);

    app.decorate('getDbPool', (clinicId: string) => {
      const pool = pools.get(clinicId);
      if (!pool) {
        throw app.httpErrors.notFound(`Clínica '${clinicId}' não encontrada`);
      }
      return pool;
    });

    app.addHook('onClose', async () => {
      app.log.info('Closing database pools...');
      const closePromises = Array.from(pools.entries()).map(async ([clinicId, pool]) => {
        try {
          await pool.destroy(); // Use destroy for Knex
          app.log.info(`✅ Pool closed for clinic ${clinicId}`);
        } catch (error) {
          app.log.error(`❌ Error closing pool for clinic ${clinicId}:`, error);
        }
      });

      await Promise.allSettled(closePromises);
      app.log.info('All database pools closed');
    });
  },
  { name: 'multiTenancy' },
);