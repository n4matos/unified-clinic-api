import { FastifyInstance } from 'fastify';
import { HealthService } from '../services/health.service';

export default async function (app: FastifyInstance) {
  const healthService = new HealthService();

  app.get(
    '/health',
    {
      schema: {
        response: {
          200: {
            type: 'object',
            properties: {
              status: { type: 'string' },
              timestamp: { type: 'string' },
              database: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const healthStatus = await healthService.status();

      const statusCode = healthStatus.status === 'ok' ? 200 : 503;

      return reply.code(statusCode).send(healthStatus);
    },
  );
}
