import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';

export default fp(async (app: FastifyInstance) => {
  app.get('/health/clinics', async (request, reply) => {
    return reply.send({
      status: 'healthy',
      message: 'API is running',
    });
  });
});
