import { FastifyInstance } from 'fastify';
import bcrypt from 'bcryptjs';
import { Client, ClientCreateRequest } from '../types/auth.types';
import { HttpError } from '../errors/http.error';

export class ClientService {
  private app: FastifyInstance;

  constructor(app: FastifyInstance) {
    this.app = app;
  }

  async getAllClients(): Promise<Omit<Client, 'client_secret'>[]> {
    const knex = this.app.getConfigDb();

    const clients = await knex('clients')
      .select('id', 'client_id', 'name', 'allowed_tenants', 'active', 'created_at')
      .where('active', true);

    return clients.map((client) => ({
      ...client,
      allowed_tenants: Array.isArray(client.allowed_tenants)
        ? client.allowed_tenants
        : JSON.parse(client.allowed_tenants),
    }));
  }

  async getClientByClientId(clientId: string): Promise<Client | null> {
    const knex = this.app.getConfigDb();

    const client = await knex('clients').where({ client_id: clientId, active: true }).first();

    if (!client) {
      return null;
    }

    return {
      ...client,
      allowed_tenants: Array.isArray(client.allowed_tenants)
        ? client.allowed_tenants
        : JSON.parse(client.allowed_tenants),
    };
  }

  async validateClient(clientId: string, clientSecret: string): Promise<Client> {
    const client = await this.getClientByClientId(clientId);

    if (!client) {
      throw new HttpError(401, 'Invalid client credentials', 'Unauthorized');
    }

    const isSecretValid = await bcrypt.compare(clientSecret, client.client_secret);
    if (!isSecretValid) {
      throw new HttpError(401, 'Invalid client credentials', 'Unauthorized');
    }

    return client;
  }

  async createClient(data: ClientCreateRequest): Promise<Omit<Client, 'client_secret'>> {
    const knex = this.app.getConfigDb();

    // Verificar se client_id já existe
    const existingClient = await knex('clients').where('client_id', data.client_id).first();

    if (existingClient) {
      throw new HttpError(409, 'Client with this ID already exists', 'Conflict');
    }

    // Verificar se todos os tenants existem
    const existingTenants = await knex('tenants')
      .whereIn('tenant_id', data.allowed_tenants)
      .pluck('tenant_id');

    const nonExistentTenants = data.allowed_tenants.filter(
      (tenant) => !existingTenants.includes(tenant)
    );

    if (nonExistentTenants.length > 0) {
      throw new HttpError(400, `Invalid tenants: ${nonExistentTenants.join(', ')}`, 'Bad Request');
    }

    // Hash da senha
    const hashedSecret = await bcrypt.hash(data.client_secret, 10);

    // Inserir client
    const [createdClient] = await knex('clients')
      .insert({
        client_id: data.client_id,
        client_secret: hashedSecret,
        name: data.name,
        allowed_tenants: JSON.stringify(data.allowed_tenants),
        active: true,
        created_at: new Date(),
        updated_at: new Date(),
      })
      .returning(['id', 'client_id', 'name', 'allowed_tenants', 'active', 'created_at']);

    return {
      ...createdClient,
      allowed_tenants: data.allowed_tenants,
    };
  }

  async updateClient(
    clientId: string,
    updates: Partial<ClientCreateRequest>
  ): Promise<Omit<Client, 'client_secret'>> {
    const knex = this.app.getConfigDb();

    const updateData: Record<string, unknown> = { updated_at: new Date() };

    if (updates.name) {
      updateData.name = updates.name;
    }

    if (updates.client_secret) {
      updateData.client_secret = await bcrypt.hash(updates.client_secret, 10);
    }

    if (updates.allowed_tenants) {
      // Verificar se todos os tenants existem
      const existingTenants = await knex('tenants')
        .whereIn('tenant_id', updates.allowed_tenants)
        .pluck('tenant_id');

      const nonExistentTenants = updates.allowed_tenants.filter(
        (tenant) => !existingTenants.includes(tenant)
      );

      if (nonExistentTenants.length > 0) {
        throw new HttpError(
          400,
          `Invalid tenants: ${nonExistentTenants.join(', ')}`,
          'Bad Request'
        );
      }

      updateData.allowed_tenants = JSON.stringify(updates.allowed_tenants);
    }

    const [updatedClient] = await knex('clients')
      .where({ client_id: clientId, active: true })
      .update(updateData)
      .returning([
        'id',
        'client_id',
        'name',
        'allowed_tenants',
        'active',
        'created_at',
        'updated_at',
      ]);

    if (!updatedClient) {
      throw new HttpError(404, 'Client not found', 'Not Found');
    }

    return {
      ...updatedClient,
      allowed_tenants: Array.isArray(updatedClient.allowed_tenants)
        ? updatedClient.allowed_tenants
        : JSON.parse(updatedClient.allowed_tenants),
    };
  }

  async deactivateClient(clientId: string): Promise<void> {
    const knex = this.app.getConfigDb();

    const result = await knex('clients').where({ client_id: clientId, active: true }).update({
      active: false,
      updated_at: new Date(),
    });

    if (result === 0) {
      throw new HttpError(404, 'Client not found', 'Not Found');
    }
  }

  async validateTenantAccess(clientId: string, tenantId: string): Promise<boolean> {
    const client = await this.getClientByClientId(clientId);

    if (!client) {
      return false;
    }

    return client.allowed_tenants.includes(tenantId);
  }
}
