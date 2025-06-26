import fp from 'fastify-plugin';
import { Pool as PgPool } from 'pg';
import mysql from 'mysql2/promise';
import { FastifyInstance } from 'fastify';
import { DbPool } from '../types/db.types.js';

interface TenantConfig {
  id: string;
  conn: string;
  type: 'postgres' | 'mysql';
}


class MysqlPoolWrapper implements DbPool {
  constructor(private pool: mysql.Pool) {}
  async query<T = any>(sql: string, params?: any[]): Promise<{ rows: T[] }> {
    const [rows] = await this.pool.query(sql, params);
    return { rows: rows as T[] };
  }
  async end(): Promise<void> {
    await this.pool.end();
  }
}

export default fp(async (app: FastifyInstance, opts: { tenants: TenantConfig[] }) => {
  const pools = new Map<string, DbPool>();

  for (const t of opts.tenants) {
    let pool: DbPool;
    if (t.type === 'postgres') {
      pool = new PgPool({ connectionString: t.conn });
    } else if (t.type === 'mysql') {
      const mysqlPool = mysql.createPool(t.conn);
      pool = new MysqlPoolWrapper(mysqlPool);
    } else {
      throw new Error(`Unknown DB type for clinic ${t.id}`);
    }
    pools.set(t.id, pool);
    app.log.info(`Pool criado p/ clínica ${t.id}`);
  }

  app.decorateRequest('db', null as unknown as DbPool);

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
