import Fastify, { FastifyInstance } from 'fastify';
import { randomUUID } from 'crypto';

import { createAppConfig } from './config/app.config';
import { PluginRegistry } from './plugins/registry';
import { HookRegistry } from './hooks/registry';

/**
 * Factory para criar e configurar a instância do Fastify
 * Implementa os princípios SOLID e padrões de design
 *
 * @returns Instância configurada do Fastify
 */
export async function buildApp(): Promise<FastifyInstance> {
  const config = createAppConfig();

  // Criação da instância Fastify com configurações externalizadas
  const app = Fastify({
    logger: config.logger,
    genReqId: () => randomUUID(),
  });

  // Usar a abordagem original mais simples por ora
  await PluginRegistry.registerInfrastructurePlugins(app);
  await PluginRegistry.registerPublicRoutes(app);
  await PluginRegistry.registerAuthMiddleware(app);
  await PluginRegistry.registerProtectedRoutes(app);

  // Registro de hooks
  HookRegistry.registerLoggingHooks(app);
  await PluginRegistry.registerMaintenanceHooks(app);

  return app;
}
