import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import fp from 'fastify-plugin';
import knex, { Knex } from 'knex';
import { userDatabaseConfig, validateDatabaseConfig } from '../config/database.config';

export interface UserDatabasePluginOptions {
  config?: typeof userDatabaseConfig;
}

async function userDatabasePlugin(
  fastify: FastifyInstance,
  options: UserDatabasePluginOptions = {},
): Promise<void> {
  const config = options.config ?? userDatabaseConfig;

  // Validar configuração
  validateDatabaseConfig(config);

  // Criar instância do banco
  const userDb: Knex = knex(config);

  // Testar conexão
  try {
    await userDb.raw('SELECT 1');
    fastify.log.info('User database connection established successfully');
  } catch (error) {
    fastify.log.error({ error }, 'Failed to connect to user database');
    throw error;
  }

  // Decorar a instância do Fastify
  fastify.decorate('userDb', userDb);

  // Métodos utilitários
  fastify.decorate('getUserDb', function () {
    return this.userDb;
  });

  fastify.decorate('isUserDbHealthy', async function () {
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
      fastify.log.info('User database connection closed');
    } catch (error) {
      fastify.log.error({ error }, 'Error closing user database connection');
    }
  });
}

export default fp(userDatabasePlugin, {
  name: 'user-database',
  dependencies: [],
});
