import { isDatabaseError } from '../types/db.error';
import { HttpError } from '../errors/http.error';
import bcrypt from 'bcryptjs';
import { DatabaseManager, TenantDbConfig } from '../config/db.config';

export class TenantService {
  private dbManager: DatabaseManager;

  constructor() {
    this.dbManager = DatabaseManager.getInstance();
  }

  async getAllTenants(): Promise<TenantDbConfig[]> {
    try {
      return await this.dbManager.getAllTenants();
    } catch (error) {
      throw new HttpError(500, `Failed to fetch tenants: ${error}`);
    }
  }

  async createTenant(tenantData: TenantDbConfig): Promise<TenantDbConfig> {
    try {
      const configDb = this.dbManager.getConfigDb();
      const [createdTenant] = await configDb('tenants').insert(tenantData).returning('*');

      return createdTenant;
    } catch (error) {
      if (isDatabaseError(error) && error.code === '23505') {
        // Unique violation error code for PostgreSQL
        throw new HttpError(409, `Tenant with this ID already exists.`);
      }
      throw new HttpError(500, `Failed to create tenant: ${(error as Error).message}`);
    }
  }

  async updateTenant(
    tenantId: string,
    updateData: Partial<TenantDbConfig>
  ): Promise<TenantDbConfig> {
    try {
      const configDb = this.dbManager.getConfigDb();

      const [updatedTenant] = await configDb('tenants')
        .where({ tenant_id: tenantId })
        .update(updateData)
        .returning('*');

      if (!updatedTenant) {
        throw new HttpError(404, 'Tenant not found');
      }

      // Refresh do pool de conexão do tenant se mudou configuração de DB
      if (
        updateData.db_host ||
        updateData.db_port ||
        updateData.db_user ||
        updateData.db_pass ||
        updateData.db_name ||
        updateData.db_type
      ) {
        await this.dbManager.refreshTenantPool(tenantId);
      }

      return updatedTenant;
    } catch (error) {
      if (error instanceof HttpError) {
        throw error;
      }
      if (isDatabaseError(error) && error.code === '23505') {
        throw new HttpError(409, `Tenant with this ID already exists.`);
      }
      throw new HttpError(500, `Failed to update tenant: ${(error as Error).message}`);
    }
  }

  async deleteTenant(tenantId: string): Promise<void> {
    try {
      const configDb = this.dbManager.getConfigDb();
      const deletedCount = await configDb('tenants').where({ tenant_id: tenantId }).del();

      if (deletedCount === 0) {
        throw new HttpError(404, 'Tenant not found');
      }

      // Remove pool de conexão do tenant
      await this.dbManager.refreshTenantPool(tenantId);
    } catch (error) {
      if (error instanceof HttpError) {
        throw error;
      }
      throw new HttpError(500, `Failed to delete tenant: ${error}`);
    }
  }
}
