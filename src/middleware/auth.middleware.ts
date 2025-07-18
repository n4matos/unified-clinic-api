import { FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';
import { ClientService } from '../services/client.service';
import { JWTService } from '../services/jwt.service';

export default fp(async (app) => {
  const clientService = new ClientService(app);

  app.decorate('authenticate', async (request: FastifyRequest, _reply: FastifyReply) => {
    const authHeader = request.headers.authorization;
    const clinicHeader = request.headers['x-clinic-id'] as string;

    // 1. Verificar Authorization header
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

    // 2. Verificar X-Clinic-ID header (obrigatório)
    if (!clinicHeader || !clinicHeader.trim()) {
      app.log.warn(
        {
          ip: request.ip,
          userAgent: request.headers['user-agent'],
          url: request.url,
        },
        'Authentication failed - Missing X-Clinic-ID header'
      );
      throw app.httpErrors.badRequest('X-Clinic-ID header is required');
    }

    const token = authHeader.split(' ')[1];
    const clinicId = clinicHeader.trim();

    try {
      // 3. Verificar token JWT
      const decoded = JWTService.verifyToken(token);

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

      // 4. Verificar se cliente pode acessar a clínica solicitada
      const hasAccess = await clientService.validateTenantAccess(clientId, clinicId);

      if (!hasAccess) {
        app.log.warn(
          {
            clientId,
            requestedClinic: clinicId,
            ip: request.ip,
          },
          `Access denied - Client ${clientId} cannot access clinic ${clinicId}`
        );
        throw app.httpErrors.forbidden(`Access denied for clinic: ${clinicId}`);
      }

      // 5. Log de autenticação bem-sucedida
      app.log.debug(
        {
          clientId,
          clinicId,
          ip: request.ip,
          userAgent: request.headers['user-agent'],
        },
        `Authentication successful - Client ${clientId} accessing clinic ${clinicId}`
      );

      // 6. Definir contexto da requisição
      request.tenantId = clinicId; // ← Agora vem do header!
      request.clientId = clientId;
      request.clinicId = clinicId; // Compatibilidade
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
