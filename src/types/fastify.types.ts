// Fastify instance extensions and module declarations

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { DbPool } from '../config/db.config';
import { ProfessionalService } from '../services/professional.service';
import { RegistrationDataService } from '../services/registration_data.service';
import { InvoiceService } from '../services/invoice.service';

declare module 'fastify' {
  interface FastifyInstance {
    // Multi-tenancy decorators
    getDbPool: (tenantId: string) => Promise<DbPool>;
    getTenantStats: () => {
      lazyLoadedTenants: number;
      failedConnections: number;
      activeConnections: string[];
      failedTenants: string[];
    };

    // Authentication decorator
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;

    // Service decorators
    professionalService: ProfessionalService;
    registrationDataService: RegistrationDataService;
    invoiceService: InvoiceService;
  }

  interface FastifyRequest {
    clinicId?: string;
    tenantId?: string;
    clientId?: string;
  }
}
