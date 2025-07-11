import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import knex, { Knex } from 'knex';
import { clinicDatabaseConfig, validateDatabaseConfig } from '../config/database.config';

export interface ClinicDatabasePluginOptions {
  config?: typeof clinicDatabaseConfig;
}

async function clinicDatabasePlugin(
  fastify: FastifyInstance,
  options: ClinicDatabasePluginOptions = {},
): Promise<void> {
  const config = options.config ?? clinicDatabaseConfig;

  // Validar configuração
  validateDatabaseConfig(config);

  // Criar instância do banco
  const userDb: Knex = knex(config);

  // Testar conexão
  try {
    await userDb.raw('SELECT 1');
    fastify.log.info('Clinic database connection established successfully');
  } catch (error) {
    fastify.log.error({ error }, 'Failed to connect to clinic database');
    throw error;
  }

  // Decorar a instância do Fastify
  fastify.decorate('userDb', userDb);

  // Métodos utilitários
  fastify.decorate('getClinicDb', function (this: FastifyInstance) {
    return this.userDb;
  });

  fastify.decorate('isClinicDbHealthy', async function (this: FastifyInstance) {
    try {
      await this.userDb.raw('SELECT 1');
      return true;
    } catch {
      return false;
    }
  });

  // Hook para fechar a conexão quando o servidor for encerrado
  fastify.addHook('onClose', async () => {
    try {
      await userDb.destroy();
      fastify.log.info('Clinic database connection closed');
    } catch (error) {
      fastify.log.error({ error }, 'Error closing clinic database connection');
    }
  });
}

export default fp(clinicDatabasePlugin, {
  name: 'clinic-database',
  dependencies: [],
});
