import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';
import { DatabaseManager } from '../config/db.config';

export default fp(
  async (app: FastifyInstance) => {
    const dbManager = DatabaseManager.getInstance();
    const lazyLoadedTenants: string[] = [];
    const failedTenantConnections: string[] = [];

    // Só valida se tenants existem no banco de configuração, não conecta ainda
    try {
      const tenants = await dbManager.getAllTenants();
      app.log.info(`Found ${tenants.length} tenants (connections will be lazy-loaded)`);

      // Log dos tenants disponíveis para debug
      tenants.forEach((tenant) => {
        app.log.info(
          `Available tenant: ${tenant.tenant_id} (${tenant.db_type}://${tenant.db_host}:${tenant.db_port}/${tenant.db_name})`
        );
      });
    } catch (error) {
      app.log.error({ error }, 'Failed to load tenant configurations from database');
      throw new Error('Cannot start without tenant configurations');
    }

    // Decorator para obter pool de conexão com lazy loading
    app.decorate('getDbPool', async (tenantId: string) => {
      try {
        // Tenta obter o pool (vai criar se não existir)
        const pool = await dbManager.getTenantPool(tenantId);

        // Log apenas na primeira conexão (lazy loading)
        if (!lazyLoadedTenants.includes(tenantId)) {
          app.log.info({ tenantId }, `[${tenantId}] Lazy-loaded tenant database connection`);
          lazyLoadedTenants.push(tenantId);
        }

        return pool;
      } catch (err) {
        app.log.error(
          {
            err,
            tenantId,
            errorType: 'tenant_connection_failed',
            timestamp: new Date().toISOString(),
          },
          `[${tenantId}] Failed to lazy-load tenant database`
        );

        // Registra falha apenas uma vez
        if (!failedTenantConnections.includes(tenantId)) {
          failedTenantConnections.push(tenantId);
        }

        throw app.httpErrors.notFound(`Tenant '${tenantId}' não encontrado ou inacessível`);
      }
    });

    // Decorator para estatísticas de conexões
    app.decorate('getTenantStats', () => {
      return {
        lazyLoadedTenants: lazyLoadedTenants.length,
        failedConnections: failedTenantConnections.length,
        activeConnections: lazyLoadedTenants.filter((t) => !failedTenantConnections.includes(t)),
        failedTenants: failedTenantConnections,
      };
    });

    // Hook para cleanup ao fechar a aplicação
    app.addHook('onClose', async () => {
      await dbManager.closeAllConnections();
      app.log.info(
        `All tenant pools closed. Stats: ${lazyLoadedTenants.length} lazy-loaded, ${failedTenantConnections.length} failed`
      );
    });
  },
  { name: 'multiTenancy' }
);
