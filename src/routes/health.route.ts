import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';

export default fp(async (app: FastifyInstance) => {
  // Health check básico da aplicação
  app.get('/health', async (request, reply) => {
    request.log.info('health check - general status');

    return reply.send({
      status: 'healthy',
      message: 'API is running',
      timestamp: new Date().toISOString(),
    });
  });

  // Health check simples do banco de dados
  app.get('/health/database', async (request, reply) => {
    request.log.info('health check - database status');

    try {
      const isHealthy = await app.isConfigDbHealthy();

      if (isHealthy) {
        return reply.send({
          status: 'healthy',
          message: 'Database is responsive',
          timestamp: new Date().toISOString(),
        });
      } else {
        return reply.status(503).send({
          status: 'unhealthy',
          message: 'Database is not responsive',
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      request.log.error({ error }, 'Database health check failed');

      return reply.status(503).send({
        status: 'unhealthy',
        message: 'Database health check failed',
        timestamp: new Date().toISOString(),
      });
    }
  });
});