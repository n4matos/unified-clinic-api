import { HttpError } from '../errors/http.error';
import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import jwt from 'jsonwebtoken';
import { TenantService } from '../services/tenant.service';

export default fp(async (app: FastifyInstance) => {
  const tenantService = new TenantService();

  // Login route with client_id and client_secret
  app.post('/auth/login', async (request, reply) => {
    const { client_id, client_secret } = request.body as {
      client_id?: string;
      client_secret?: string;
    };

    if (!client_id || !client_secret) {
      throw new HttpError(400, 'client_id and client_secret are required');
    }

    const tenant = await tenantService.validateTenant(client_id, client_secret);

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      app.log.error('JWT_SECRET is not defined');
      throw new HttpError(500, 'Server configuration error');
    }

    const now = Math.floor(Date.now() / 1000);
    const token = jwt.sign(
      {
        sub: client_id,
        tenant_id: tenant.tenant_id,
        iat: now,
        exp: now + 3600, // 1 hour
      },
      secret
    );

    return reply.send({ token });
  });
});
