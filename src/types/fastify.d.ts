// Fastify instance extensions and module declarations

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { Knex } from 'knex';
import { DbPool } from '../config/db.config';
import { ProfessionalService } from '../services/professional.service';
import { PatientService } from '../services/patient.service';

declare module 'fastify' {
  interface FastifyInstance {
    // Database decorators
    configDb: Knex;
    getConfigDb(): Knex;
    isConfigDbHealthy(): Promise<boolean>;

    // Multi-tenancy decorators
    getDbPool: (tenantId: string) => Promise<DbPool>;
    getTenantStats: () => {
      lazyLoadedTenants: number;
      failedConnections: number;
      activeConnections: string[];
      failedTenants: string[];
    };

    // Compatibility (deprecated)
    failedTenantInitializations: string[];

    // Authentication decorator
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;

    // Service decorators
    professionalService: ProfessionalService;
    patientService: PatientService;
  }

  interface FastifyRequest {
    clinicId?: string;
    tenantId?: string;
    clientId?: string;
  }
}
