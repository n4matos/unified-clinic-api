import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import knex, { Knex } from 'knex';
import { configDatabaseConfig, validateDatabaseConfig, DatabaseConfig } from '../config/db.config';

export interface ConfigDatabasePluginOptions {
  config?: DatabaseConfig;
}

async function configDatabasePlugin(
  fastify: FastifyInstance,
  options: ConfigDatabasePluginOptions = {},
): Promise<void> {
  const config = options.config ?? configDatabaseConfig;

  // Validar configuração
  validateDatabaseConfig(config);

  // Criar instância do banco
  const configDb: Knex = knex(config);

  // Testar conexão
  try {
    await configDb.raw('SELECT 1');
    fastify.log.info('Config database connection established successfully');
  } catch (error) {
    fastify.log.error({ error }, 'Failed to connect to config database');
    throw error;
  }

  // Decorar a instância do Fastify
  fastify.decorate('configDb', configDb);

  // Métodos utilitários
  fastify.decorate('getConfigDb', function (this: FastifyInstance) {
    return this.configDb;
  });

  fastify.decorate('isConfigDbHealthy', async function (this: FastifyInstance) {
    try {
      await this.configDb.raw('SELECT 1');
      return true;
    } catch {
      return false;
    }
  });

  // Hook para fechar a conexão quando o servidor for encerrado
  fastify.addHook('onClose', async () => {
    try {
      await configDb.destroy();
      fastify.log.info('Config database connection closed');
    } catch (error) {
      fastify.log.error({ error }, 'Error closing config database connection');
    }
  });
}

export default fp(configDatabasePlugin, {
  name: 'config-database',
  dependencies: [],
});
