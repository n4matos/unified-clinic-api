import 'fastify';
import { FastifyReply, FastifyRequest } from 'fastify';
import { Knex } from 'knex';

declare module 'fastify' {
  interface FastifyRequest {
    clinicId?: string;
  }
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    getDbPool: (clinicId: string) => DbPool;
    failedTenantInitializations: string[];
  }
}
