import { FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';
import jwt from 'jsonwebtoken';
import { ClinicRepository } from '../repositories/clinic.repository';

declare module 'fastify' {
  interface FastifyRequest {
    clinicId?: string;
    clientId?: string;
  }
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

export default fp(async (app) => {
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
        clinic_id: string;
        iat: number;
        exp: number;
      };

      const clientId = decoded.sub;
      const clinicId = decoded.clinic_id;

      // Verify if the clinic still exists
      const clinicRepository = new ClinicRepository(app.userDb);
      const clinic = await clinicRepository.findById(clinicId);

      if (!clinic) {
        throw app.httpErrors.forbidden('Clinic not found or deactivated');
      }

      // Verify if the client_id in the token matches the clinic's client_id
      if (clinic.client_id !== clientId) {
        throw app.httpErrors.forbidden('Invalid client credentials in token');
      }

      request.clinicId = clinicId;
      request.clientId = clientId;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw app.httpErrors.unauthorized(`Invalid token: ${error.message}`);
      }
      app.log.error({ error }, 'JWT verification failed');
      throw app.httpErrors.internalServerError('Internal server error');
    }
  });
});
