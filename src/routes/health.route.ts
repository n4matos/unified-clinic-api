import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';

export default fp(async (app: FastifyInstance) => {
  app.get('/health', async (request, reply) => {
    request.log.info('health check - general status');

    return reply.send({
      status: 'healthy',
      message: 'API is running',
      timestamp: new Date().toISOString(),
    });
  });

  app.get('/health/clinics', async (request, reply) => {
    const failedInitializations = app.failedTenantInitializations || [];
    const overallStatus = failedInitializations.length > 0 ? 'degraded' : 'healthy';
    const message =
      overallStatus === 'degraded'
        ? 'API is running with some tenant initialization failures'
        : 'API is running';

    request.log.info(
      {
        status: overallStatus,
        failedCount: failedInitializations.length,
        failedTenants: failedInitializations,
      },
      'health check - clinics status',
    );

    return reply.send({
      status: overallStatus,
      message,
      failedTenantInitializations: failedInitializations,
    });
  });
});
