import { FastifyInstance } from 'fastify';
import { HealthController } from '../controllers/health.controller';

export default async function (app: FastifyInstance) {
  const controller = new HealthController();

  app.get(
    '/health',
    {
      schema: {
        response: {
          200: {
            type: 'object',
            properties: { status: { type: 'string' } },
          },
        },
      },
    },
    controller.check.bind(controller),
  );
}
