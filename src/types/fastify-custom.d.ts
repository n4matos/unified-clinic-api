import 'fastify';
import { FastifyReply, FastifyRequest } from 'fastify';
import { Knex } from 'knex';
import { DbPool } from '../config/db.config';

// Interface para estatísticas de tenants
interface TenantStats {
  lazyLoadedTenants: number;
  failedConnections: number;
  activeConnections: string[];
  failedTenants: string[];
}

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
    
    // Novo sistema de estatísticas com lazy loading
    getTenantStats: () => TenantStats;
    
    // Compatibilidade com versão antiga (deprecated)
    failedTenantInitializations: string[];

    // Métodos utilitários para o banco de configurações
    getConfigDb(): Knex;
    isConfigDbHealthy(): Promise<boolean>;
  }
}
