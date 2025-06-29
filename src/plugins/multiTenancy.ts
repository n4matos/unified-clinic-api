import fp from 'fastify-plugin';
import knex, { Knex } from 'knex';
import { FastifyInstance } from 'fastify';
import { DbPool } from '../types/db.types.js';

interface TenantConfig {
  id: string;
  connEnv: string;
  type: 'postgres' | 'mysql';
}

export default fp(
  async (app: FastifyInstance, opts: { tenants: TenantConfig[] }) => {
    const pools = new Map<string, DbPool>();
    const initErrors: string[] = [];

    // Função para testar conexão
    async function testConnection(pool: DbPool, clinicId: string): Promise<string | null> {
      try {
        await pool.raw('SELECT 1');
        return null; // No error
      } catch (error: any) {
        const errorMessage = `Connection test failed for clinic ${clinicId}: ${error.message}`;
        app.log.error({ err: error }, errorMessage);
        return errorMessage;
      }
    }

    // Inicializar pools com validação
    for (const t of opts.tenants) {
      try {
        let pool: DbPool;
        const connString = process.env[t.connEnv];

        if (!connString) {
          throw new Error(`Connection string not found for environment variable ${t.connEnv}`);
        }

        if (t.type === 'postgres') {
          pool = knex({
            client: 'pg',
            connection: connString,
            pool: {
              min: 2,
              max: 10,
            },
          }) as DbPool;
          pool.type = 'postgres';
        } else if (t.type === 'mysql') {
          pool = knex({
            client: 'mysql2',
            connection: connString,
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
        const connectionError = await testConnection(pool, t.id);
        if (connectionError) {
          initErrors.push(connectionError);
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

    if (initErrors.length > 0) {
      app.log.warn(`Some clinics failed to initialize: ${initErrors.join('; ')}`);
    }

    app.log.info(
      `Multi-tenancy initialized with ${pools.size} clinic(s): ${Array.from(pools.keys()).join(', ')}`,
    );

    app.decorate('failedTenantInitializations', initErrors);

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


