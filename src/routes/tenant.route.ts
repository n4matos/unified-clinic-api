import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { Static, Type } from '@sinclair/typebox';
import { TenantService } from '../services/tenant.service';

// Schema for the tenant object (without sensitive data)
const TenantSchema = Type.Object({
  tenant_id: Type.String(),
  client_id: Type.String(),
  db_type: Type.Union([Type.Literal('pg'), Type.Literal('mssql'), Type.Literal('mysql')]),
  db_host: Type.String(),
  db_port: Type.Number(),
  db_name: Type.String(),
});

// Schema for creating a new tenant (includes all fields)
const CreateTenantSchema = Type.Intersect([
  TenantSchema,
  Type.Object({
    client_secret: Type.String(),
    db_user: Type.String(),
    db_pass: Type.String(),
  }),
]);

// Schema for updating a tenant (all fields are partial)
const UpdateTenantSchema = Type.Partial(CreateTenantSchema);

// Type definitions from schemas
type CreateTenantBody = Static<typeof CreateTenantSchema>;
type UpdateTenantBody = Static<typeof UpdateTenantSchema>;

// Schema for route parameters
const TenantParams = Type.Object({
  tenantId: Type.String(),
});
type TenantParamsType = Static<typeof TenantParams>;

export default fp(async (app: FastifyInstance) => {
  const tenantService = new TenantService();

  // Rota para listar todos os tenants
  app.get(
    '/tenants',
    {
      schema: {
        response: {
          200: Type.Array(TenantSchema),
        },
      },
    },
    async (request, reply) => {
      const tenants = await tenantService.getAllTenants();
      return reply.send(tenants);
    }
  );

  // Rota para criar um novo tenant
  app.post<{ Body: CreateTenantBody }>(
    '/tenants',
    {
      schema: {
        body: CreateTenantSchema,
        response: {
          201: TenantSchema,
        },
      },
    },
    async (request, reply) => {
      const tenant = await tenantService.createTenant(request.body);
      return reply.code(201).send(tenant);
    }
  );

  // Rota para atualizar um tenant
  app.put<{ Body: UpdateTenantBody; Params: TenantParamsType }>(
    '/tenants/:tenantId',
    {
      schema: {
        body: UpdateTenantSchema,
        params: TenantParams,
        response: {
          200: TenantSchema,
        },
      },
    },
    async (request, reply) => {
      const { tenantId } = request.params;
      const tenant = await tenantService.updateTenant(tenantId, request.body);
      return reply.send(tenant);
    }
  );

  // Rota para deletar um tenant
  app.delete<{ Params: TenantParamsType }>(
    '/tenants/:tenantId',
    {
      schema: {
        params: TenantParams,
        response: {
          204: Type.Null(),
        },
      },
    },
    async (request, reply) => {
      const { tenantId } = request.params;
      await tenantService.deleteTenant(tenantId);
      return reply.code(204).send();
    }
  );
});
