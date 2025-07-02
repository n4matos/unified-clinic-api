import { Knex } from 'knex';
import { config } from '../config';

export interface DatabaseConfig {
  client: string;
  connection: string | Knex.ConnectionConfig;
  pool?: {
    min: number;
    max: number;
  };
  acquireConnectionTimeout?: number;
}

export const userDatabaseConfig: DatabaseConfig = {
  client: 'pg',
  connection: config.userDatabase.url,
  pool: {
    min: config.userDatabase.poolMin,
    max: config.userDatabase.poolMax,
  },
  acquireConnectionTimeout: config.userDatabase.timeout,
};

export const validateDatabaseConfig = (config: DatabaseConfig): void => {
  if (!config.client) {
    throw new Error('Database client is required');
  }

  if (!config.connection) {
    throw new Error('Database connection is required');
  }

  if (config.pool) {
    if (config.pool.min < 0 || config.pool.max < config.pool.min) {
      throw new Error('Invalid pool configuration');
    }
  }
};
