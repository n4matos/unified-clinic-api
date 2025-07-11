import { HttpError } from '../errors/http.error';
import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import jwt from 'jsonwebtoken';
import { ClinicService } from '../services/clinic.service';
import { ClinicRepository } from '../repositories/clinic.repository';
import { Knex } from 'knex';

declare module 'fastify' {
  interface FastifyInstance {
    userDb: Knex;
  }
}

export default fp(async (app: FastifyInstance) => {
  const clinicRepository = new ClinicRepository(app.userDb);
  const clinicService = new ClinicService(clinicRepository);

  // Login route with client_id and client_secret
  app.post('/auth/login', async (request, reply) => {
    const { client_id, client_secret } = request.body as {
      client_id?: string;
      client_secret?: string;
    };

    if (!client_id || !client_secret) {
      throw new HttpError(400, 'client_id and client_secret are required');
    }

    const clinic = await clinicService.validateClinic(client_id, client_secret);

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      app.log.error('JWT_SECRET is not defined');
      throw new HttpError(500, 'Server configuration error');
    }

    const now = Math.floor(Date.now() / 1000);
    const token = jwt.sign(
      {
        sub: client_id,
        clinic_id: clinic.clinic_id,
        iat: now,
        exp: now + 3600, // 1 hour
      },
      secret,
    );

    return reply.send({ token });
  });
});
