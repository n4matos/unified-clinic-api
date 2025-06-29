import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';

export default fp(async (app: FastifyInstance) => {
  app.get('/health/clinics', async (request, reply) => {
    const overallStatus = app.failedTenantInitializations.length > 0 ? 'degraded' : 'healthy';
    const message =
      overallStatus === 'degraded'
        ? 'API is running with some tenant initialization failures'
        : 'API is running';

    return reply.send({
      status: overallStatus,
      message,
      failedTenantInitializations: app.failedTenantInitializations,
    });
  });
});
