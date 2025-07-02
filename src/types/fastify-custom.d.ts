import 'fastify';
import { FastifyReply, FastifyRequest } from 'fastify';
import { Knex } from 'knex';
import { DbPool } from './db.types';

declare module 'fastify' {
  interface FastifyRequest {
    clinicId?: string;
  }
  interface FastifyInstance {
    userDb: Knex;
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    getDbPool: (clinicId: string) => DbPool;
    failedTenantInitializations: string[];
  }
}
