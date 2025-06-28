import 'fastify';
import { DbPool } from './db.types';

declare module 'fastify' {
  interface FastifyRequest {
    db: DbPool;
  }
}
