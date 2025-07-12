import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';
import { DatabaseManager } from '../config/db.config';

export default fp(
  async (app: FastifyInstance) => {
    const dbManager = DatabaseManager.getInstance();
    const failedTenantInitializations: string[] = [];

    // Tenta carregar todos os tenants no startup
    try {
      const tenants = await dbManager.getAllTenants();

      for (const tenant of tenants) {
        try {
          // Tenta criar conexão com o tenant
          await dbManager.getTenantPool(tenant.tenant_id);
          app.log.info(`✅ DB ready - tenant ${tenant.tenant_id}`);
        } catch (err) {
          app.log.error({ err }, `❌ DB fail - tenant ${tenant.tenant_id}`);
          failedTenantInitializations.push(tenant.tenant_id);
        }
      }
    } catch (error) {
      app.log.error({ error }, 'Failed to load tenants from database');
    }

    app.decorate('getDbPool', async (tenantId: string) => {
      try {
        const pool = await dbManager.getTenantPool(tenantId);
        return pool;
      } catch {
        throw app.httpErrors.notFound(`Tenant '${tenantId}' não encontrado ou inacessível`);
      }
    });

    app.decorate('failedTenantInitializations', failedTenantInitializations);

    app.addHook('onClose', async () => {
      await dbManager.closeAllConnections();
      app.log.info('All tenant pools closed');
    });
  },
  { name: 'multiTenancy' }
);
