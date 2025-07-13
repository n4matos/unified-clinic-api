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
      app.log.warn(
        {
          ip: request.ip,
          userAgent: request.headers['user-agent'],
          url: request.url,
        },
        'Authentication failed - Missing or invalid authorization header'
      );
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
        app.log.warn(
          {
            clientId,
            tenantId,
            ip: request.ip,
          },
          `[${tenantId}] Authentication failed - Tenant not found or deactivated`
        );
        throw app.httpErrors.forbidden('Tenant not found or deactivated');
      }

      // Verifica se o tenant_id no token corresponde ao tenant
      if (tenant.tenant_id !== tenantId) {
        app.log.warn(
          {
            clientId,
            tenantId,
            expectedTenantId: tenant.tenant_id,
            ip: request.ip,
          },
          `[${tenantId}] Authentication failed - Tenant ID mismatch in token`
        );
        throw app.httpErrors.forbidden('Invalid tenant credentials in token');
      }

      // Log de autenticação bem-sucedida
      app.log.debug(
        {
          clientId,
          tenantId,
          ip: request.ip,
          userAgent: request.headers['user-agent'],
        },
        `[${tenantId}] Authentication successful`
      );

      request.tenantId = tenantId;
      request.clientId = clientId;
      // Manter compatibilidade com código existente
      request.clinicId = tenantId;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        app.log.warn(
          {
            error: error.message,
            ip: request.ip,
            userAgent: request.headers['user-agent'],
          },
          'JWT verification failed - Invalid token'
        );
        throw app.httpErrors.unauthorized(`Invalid token: ${error.message}`);
      }
      app.log.error(
        {
          error,
          ip: request.ip,
          userAgent: request.headers['user-agent'],
        },
        'JWT verification failed - Internal error'
      );
      throw app.httpErrors.internalServerError('Internal server error');
    }
  });
});
