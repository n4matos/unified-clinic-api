import { FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';
import jwt from 'jsonwebtoken';
import { TenantService } from '../services/tenant.service';

declare module 'fastify' {
  interface FastifyRequest {
    clinicId?: string;
    tenantId?: string;
    clientId?: string;
  }
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

export default fp(async (app) => {
  const tenantService = new TenantService();

  app.decorate('authenticate', async (request: FastifyRequest, _reply: FastifyReply) => {
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
      const decoded = jwt.verify(token, secret) as {
        sub: string;
        tenant_id: string;
        iat: number;
        exp: number;
      };

      const clientId = decoded.sub;
      const tenantId = decoded.tenant_id;

      // Verifica se o tenant ainda existe
      const tenant = await tenantService.getTenantByClientId(clientId);

      if (!tenant) {
        throw app.httpErrors.forbidden('Tenant not found or deactivated');
      }

      // Verifica se o tenant_id no token corresponde ao tenant
      if (tenant.tenant_id !== tenantId) {
        throw app.httpErrors.forbidden('Invalid tenant credentials in token');
      }

      request.tenantId = tenantId;
      request.clientId = clientId;
      // Manter compatibilidade com código existente
      request.clinicId = tenantId;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw app.httpErrors.unauthorized(`Invalid token: ${error.message}`);
      }
      app.log.error({ error }, 'JWT verification failed');
      throw app.httpErrors.internalServerError('Internal server error');
    }
  });
});
