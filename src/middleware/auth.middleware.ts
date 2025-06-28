import { FastifyRequest, FastifyReply, HookHandlerDoneFunction } from 'fastify';
import fp from 'fastify-plugin';
import jwt from 'jsonwebtoken';
import { getTenantConfig } from '../config/tenants.config';

declare module 'fastify' {
  interface FastifyRequest {
    clinicId?: string;
  }
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

export default fp(async (app) => {
  app.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw app.httpErrors.unauthorized('Authorization token is missing or invalid');
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      app.log.error('JWT_SECRET is not defined');
      throw app.httpErrors.internalServerError('Server configuration error');
    }

    try {
      const decoded = jwt.verify(token, secret) as { clinicId: string };
      const clinicId = decoded.clinicId;

      const tenantConfig = getTenantConfig(clinicId);

      if (!tenantConfig) {
        throw app.httpErrors.forbidden('Invalid clinic ID in token');
      }

      request.clinicId = clinicId;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw app.httpErrors.unauthorized(`Invalid token: ${error.message}`);
      }
      app.log.error({ error }, 'JWT verification failed');
      throw app.httpErrors.internalServerError('Internal server error');
    }
  });
});