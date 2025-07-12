import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { TenantService } from '../services/tenant.service';
import { TenantDbConfig } from '../config/db.config';

export default fp(async (app: FastifyInstance) => {
  const tenantService = new TenantService();

  // Rota para listar todos os tenants (apenas para administração)
  app.get('/tenants', async (request, reply) => {
    const tenants = await tenantService.getAllTenants();

    // Remove informações sensíveis antes de retornar
    const safeTenants = tenants.map((tenant) => ({
      tenant_id: tenant.tenant_id,
      client_id: tenant.client_id,
      db_type: tenant.db_type,
      db_host: tenant.db_host,
      db_port: tenant.db_port,
      db_name: tenant.db_name,
      // Não retorna client_secret, db_user, db_pass
    }));

    return reply.send(safeTenants);
  });

  // Rota para criar um novo tenant
  app.post('/tenants', async (request, reply) => {
    const tenantData = request.body as Omit<TenantDbConfig, 'client_secret'> & {
      client_secret: string;
    };

    const tenant = await tenantService.createTenant(tenantData);

    // Remove informações sensíveis antes de retornar
    const safeTenant = {
      tenant_id: tenant.tenant_id,
      client_id: tenant.client_id,
      db_type: tenant.db_type,
      db_host: tenant.db_host,
      db_port: tenant.db_port,
      db_name: tenant.db_name,
    };

    return reply.code(201).send(safeTenant);
  });

  // Rota para atualizar um tenant
  app.put('/tenants/:tenantId', async (request, reply) => {
    const { tenantId } = request.params as { tenantId: string };
    const updateData = request.body as Partial<TenantDbConfig>;

    const tenant = await tenantService.updateTenant(tenantId, updateData);

    // Remove informações sensíveis antes de retornar
    const safeTenant = {
      tenant_id: tenant.tenant_id,
      client_id: tenant.client_id,
      db_type: tenant.db_type,
      db_host: tenant.db_host,
      db_port: tenant.db_port,
      db_name: tenant.db_name,
    };

    return reply.send(safeTenant);
  });

  // Rota para deletar um tenant
  app.delete('/tenants/:tenantId', async (request, reply) => {
    const { tenantId } = request.params as { tenantId: string };

    await tenantService.deleteTenant(tenantId);

    return reply.code(204).send();
  });
});
