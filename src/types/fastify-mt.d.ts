import 'fastify';
import { Pool } from 'pg';

declare module 'fastify' {
  interface FastifyRequest {
    db: Pool;
  }
}
