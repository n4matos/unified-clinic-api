import { FastifyInstance } from 'fastify';

// Plugins de infraestrutura
import helmet from '@fastify/helmet';
import sensible from '@fastify/sensible';
import errorHandler from '../plugins/errorHandler';
import configDatabase from '../plugins/configDatabase';
import multiTenancy from '../plugins/multiTenancy';
import appServices from '../plugins/appServices';

// Middleware
import authMiddleware from '../middleware/auth.middleware';

// Rotas
import authRoutes from '../routes/auth.route';
import healthRoutes from '../routes/health.route';
import tenantRoutes from '../routes/tenant.route';
import patientRoutes from '../routes/patient.route';
import guideRoutes from '../routes/guide.route';

/**
 * Registry para organizar o registro de plugins, rotas e middleware
 * Implementa o padrão Registry para melhor organização
 */
export class PluginRegistry {
  /**
   * Registra plugins essenciais de infraestrutura
   */
  static async registerInfrastructurePlugins(app: FastifyInstance): Promise<void> {
    // Plugins comuns
    await app.register(helmet);
    await app.register(errorHandler);
    await app.register(sensible);

    // Banco de configurações
    await app.register(configDatabase);

    // Multi-tenancy
    await app.register(multiTenancy);

    // Application Services (Repositories and Services)
    await app.register(appServices);
  }

  /**
   * Registra rotas públicas que não requerem autenticação
   */
  static async registerPublicRoutes(app: FastifyInstance): Promise<void> {
    await app.register(authRoutes);
    await app.register(healthRoutes);
    await app.register(tenantRoutes);
  }

  /**
   * Registra middleware de autenticação
   */
  static async registerAuthMiddleware(app: FastifyInstance): Promise<void> {
    await app.register(authMiddleware);
  }

  /**
   * Registra rotas protegidas (futuras implementações)
   */
  static async registerProtectedRoutes(app: FastifyInstance): Promise<void> {
    // Rotas que requerem autenticação
    await app.register(patientRoutes);
    await app.register(guideRoutes);
  }
}
