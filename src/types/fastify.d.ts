// Fastify instance extensions and module declarations

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { Knex } from 'knex';
import { DbPool } from '../config/db.config';
import { ProfessionalService } from '../services/professional.service';
import { PatientService } from '../services/patient.service';
import { LoggerService } from '../services/logger.service';
import { RefreshTokenService } from '../services/refresh-token.service';

declare module 'fastify' {
  interface FastifyInstance {
    // Database decorators
    configDb: Knex;
    getConfigDb(): Knex;
    isConfigDbHealthy(): Promise<boolean>;

    // Multi-tenancy decorators
    getDbPool: (clinicId: string) => Promise<DbPool>;

    // Authentication decorator
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;

    // Service decorators
    professionalService: ProfessionalService;
    patientService: PatientService;
    loggerService: LoggerService;
    refreshTokenService: RefreshTokenService;
  }

  interface FastifyRequest {
    clinicId?: string;
  }
}
