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
    const tenantStats = app.getTenantStats();
    const overallStatus = tenantStats.failedConnections > 0 ? 'degraded' : 'healthy';
    const message =
      overallStatus === 'degraded'
        ? 'API is running with some tenant connection failures'
        : 'API is running with lazy-loaded tenant connections';

    request.log.info(
      {
        status: overallStatus,
        ...tenantStats,
      },
      'health check - clinics status'
    );

    return reply.send({
      status: overallStatus,
      message,
      statistics: {
        lazyLoadedTenants: tenantStats.lazyLoadedTenants,
        failedConnections: tenantStats.failedConnections,
        activeConnections: tenantStats.activeConnections.length,
        failedTenants: tenantStats.failedTenants,
      },
      timestamp: new Date().toISOString(),
    });
  });

  app.get('/health/configdb', async (request, reply) => {
    request.log.info('health check - config database status');

    try {
      const isHealthy = await app.isConfigDbHealthy();

      if (isHealthy) {
        return reply.send({
          status: 'healthy',
          message: 'Config database is responsive',
          timestamp: new Date().toISOString(),
        });
      } else {
        return reply.status(503).send({
          status: 'unhealthy',
          message: 'Config database is not responsive',
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      request.log.error({ error }, 'Config database health check failed');

      return reply.status(503).send({
        status: 'unhealthy',
        message: 'Config database health check failed',
        timestamp: new Date().toISOString(),
      });
    }
  });
});
