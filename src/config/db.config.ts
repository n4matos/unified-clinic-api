import knex, { Knex } from 'knex';
import { config } from '../config';

export interface TenantDbConfig {
  tenant_id: string;
  name: string;
  db_type: 'pg' | 'mssql' | 'mysql';
  db_host: string;
  db_port: number;
  db_user: string;
  db_pass: string;
  db_name: string;
}

export interface DbPool extends Knex {
  type: 'pg' | 'mssql' | 'mysql' | 'postgres';
}

export class DatabaseManager {
  private static instance: DatabaseManager;
  private configDb: Knex;
  private tenantPools: Map<string, DbPool> = new Map();

  private constructor() {
    // Inicializa conexão com banco de configurações para leitura da tabela tenants
    this.configDb = knex({
      client: 'pg',
      connection: config.clinicsDatabase.url,
      pool: {
        min: config.clinicsDatabase.poolMin,
        max: config.clinicsDatabase.poolMax,
      },
      acquireConnectionTimeout: config.clinicsDatabase.timeout,
    });
  }

  static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  getConfigDb(): Knex {
    return this.configDb;
  }

  async getTenantPool(tenantId: string): Promise<DbPool> {
    // Se o pool já existe no cache, retorna ele
    if (this.tenantPools.has(tenantId)) {
      return this.tenantPools.get(tenantId)!;
    }

    // Busca configuração do tenant no banco de configurações
    const tenantConfig = await this.configDb('tenants')
      .where({ tenant_id: tenantId })
      .first<TenantDbConfig>();

    if (!tenantConfig) {
      throw new Error(`Tenant '${tenantId}' not found`);
    }

    // Cria nova conexão baseada na configuração do tenant
    const pool = await this.createTenantPool(tenantConfig);

    // Armazena no cache
    this.tenantPools.set(tenantId, pool);

    return pool;
  }

  private async createTenantPool(config: TenantDbConfig): Promise<DbPool> {
    let client: string;
    let connectionConfig: string | object;

    switch (config.db_type) {
      case 'pg':
        client = 'pg';
        connectionConfig = `postgresql://${config.db_user}:${config.db_pass}@${config.db_host}:${config.db_port}/${config.db_name}`;
        break;
      case 'mysql':
        client = 'mysql2';
        connectionConfig = `mysql://${config.db_user}:${config.db_pass}@${config.db_host}:${config.db_port}/${config.db_name}`;
        break;
      case 'mssql':
        client = 'mssql';
        connectionConfig = {
          server: config.db_host,
          port: config.db_port,
          user: config.db_user,
          password: config.db_pass,
          database: config.db_name,
          options: {
            encrypt: false, // Use true se estiver usando SSL
            trustServerCertificate: true, // Para desenvolvimento local
            enableArithAbort: true,
          },
        };
        break;
      default:
        throw new Error(`Unsupported database type: ${config.db_type}`);
    }

    const pool = knex({
      client,
      connection: connectionConfig,
      pool: { min: 1, max: 5 },
    }) as DbPool;

    // Normalizar o tipo para compatibilidade
    pool.type = config.db_type === 'pg' ? 'postgres' : config.db_type;

    // Testa a conexão
    try {
      await pool.raw('SELECT 1');
      return pool;
    } catch (error) {
      await pool.destroy();
      throw new Error(`Failed to connect to tenant database: ${error}`);
    }
  }

  async getAllTenants(): Promise<TenantDbConfig[]> {
    return this.configDb('tenants').select('*');
  }

  async refreshTenantPool(tenantId: string): Promise<void> {
    // Remove do cache para forçar recarregar na próxima consulta
    const existingPool = this.tenantPools.get(tenantId);
    if (existingPool) {
      await existingPool.destroy();
      this.tenantPools.delete(tenantId);
    }
  }

  async closeAllConnections(): Promise<void> {
    // Fecha todas as conexões dos tenants
    await Promise.allSettled(Array.from(this.tenantPools.values()).map((pool) => pool.destroy()));
    this.tenantPools.clear();

    // Fecha conexão com banco de configurações
    await this.configDb.destroy();
  }
}

// Configuração para o banco central (configurações/tenants)
export interface DatabaseConfig {
  client: string;
  connection: string | Knex.ConnectionConfig;
  pool?: {
    min: number;
    max: number;
  };
  acquireConnectionTimeout?: number;
}

export const configDatabaseConfig: DatabaseConfig = {
  client: 'pg',
  connection: config.clinicsDatabase.url,
  pool: {
    min: config.clinicsDatabase.poolMin,
    max: config.clinicsDatabase.poolMax,
  },
  acquireConnectionTimeout: config.clinicsDatabase.timeout,
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
