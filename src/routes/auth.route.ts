import { HttpError } from '../errors/http.error';
import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import jwt from 'jsonwebtoken';
import { getTenantConfig } from '../config/tenants.config';
import { UserService } from '../services/user.service';
import { UserRepository } from '../repositories/user.repository';
import { Knex } from 'knex';

declare module 'fastify' {
  interface FastifyInstance {
    userDb: Knex;
  }
}

export default fp(async (app: FastifyInstance) => {
  const userRepository = new UserRepository(app.userDb);
  const userService = new UserService(userRepository);

  // Login route
  app.post('/auth/login', async (request, reply) => {
    const { username, password } = request.body as {
      username?: string;
      password?: string;
    };

    if (!username || !password) {
      throw new HttpError(400, 'Username and password are required');
    }

    const user = await userService.validateUser(username, password);

    const tenantConfig = getTenantConfig(user.clinic_id);

    if (!tenantConfig) {
      // This should ideally not happen if user data is consistent with tenant configs
      app.log.error(`Tenant config not found for user's clinic_id: ${user.clinic_id}`);
      throw new HttpError(500, 'Server configuration error');
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      app.log.error('JWT_SECRET is not defined');
      throw new HttpError(500, 'Server configuration error');
    }

    const token = jwt.sign({ clinicId: user.clinic_id }, secret, { expiresIn: '1h' });

    return reply.send({ token });
  });

  // Registration route (for initial user setup)
  app.post('/auth/register', async (request, reply) => {
    const { username, password, clinicId } = request.body as {
      username?: string;
      password?: string;
      clinicId?: string;
    };

    if (!username || !password || !clinicId) {
      throw new HttpError(400, 'Username, password, and clinicId are required');
    }

    const tenantConfig = getTenantConfig(clinicId);
    if (!tenantConfig) {
      throw new HttpError(404, 'Clinic not found or not active');
    }

    const existingUser = await userRepository.findByUsername(username);
    if (existingUser) {
      throw new HttpError(409, 'Username already exists');
    }

    const newUser = await userService.createUser({
      username,
      password,
      clinic_id: clinicId,
    });
    return reply.status(201).send({
      message: 'User registered successfully',
      user: { id: newUser.id, username: newUser.username, clinic_id: newUser.clinic_id },
    });
  });
});
