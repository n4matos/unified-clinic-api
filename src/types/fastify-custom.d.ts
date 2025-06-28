import 'fastify';
import { DbPool } from './db.types';

declare module 'fastify' {
  interface FastifyRequest {
    clinicId?: string;
  }
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    getDbPool: (clinicId: string) => DbPool;
  }
}