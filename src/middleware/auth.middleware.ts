import { FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';
import { TenantService } from '../services/tenant.service';
import { JWTService } from '../services/jwt.service';

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

    try {
      const decoded = JWTService.verifyToken(token);
      
      // Verificar se é um access token
      if (decoded.type !== 'access') {
        app.log.warn(
          {
            tokenType: decoded.type,
            ip: request.ip,
          },
          'Invalid token type for authentication'
        );
        throw app.httpErrors.unauthorized('Invalid token type');
      }

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
      app.log.warn(
        {
          error: error instanceof Error ? error.message : 'Unknown error',
          ip: request.ip,
          userAgent: request.headers['user-agent'],
        },
        'JWT verification failed'
      );
      
      // Re-throw the error as-is since JWTService already handles error types properly
      if (error instanceof Error && error.message.includes('Invalid token')) {
        throw app.httpErrors.unauthorized(error.message);
      }
      throw app.httpErrors.internalServerError('Token verification failed');
    }
  });
});
