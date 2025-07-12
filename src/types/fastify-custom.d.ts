import 'fastify';
import { FastifyReply, FastifyRequest } from 'fastify';
import { Knex } from 'knex';
import { DbPool } from '../config/db.config';

declare module 'fastify' {
  interface FastifyRequest {
    tenantId?: string;
    clientId?: string;
    // Manter compatibilidade com código legado
    clinicId?: string;
  }
  interface FastifyInstance {
    configDb: Knex;
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    getDbPool: (tenantId: string) => Promise<DbPool>;
    failedTenantInitializations: string[];

    // Métodos utilitários para o banco de configurações
    getConfigDb(): Knex;
    isConfigDbHealthy(): Promise<boolean>;
  }
}
