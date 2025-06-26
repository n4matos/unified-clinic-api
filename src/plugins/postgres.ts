import fp from 'fastify-plugin';
import { Pool } from 'pg';
import { FastifyInstance } from 'fastify';

export default fp(
  async (fastify: FastifyInstance) => {
    const pool = new Pool({
      connectionString:
        process.env.DATABASE_URL || 'postgres://user:password@localhost:5432/unified_clinic',
    });

    // Disponibiliza o pool como app.pg
    fastify.decorate('pg', pool);

    // Fecha o pool ao desligar o servidor
    fastify.addHook('onClose', async () => {
      await pool.end();
    });
  },
  { name: 'postgres' },
);
