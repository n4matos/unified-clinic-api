import { FastifyInstance } from 'fastify';

export class HookRegistry {
  /**
   * Registra hooks de logging e monitoramento
   */
  static registerLoggingHooks(_app: FastifyInstance): void {
    // O Fastify já faz log automático de request/response
    // Removemos o hook customizado para evitar duplicação
    // Aqui podemos adicionar hooks personalizados específicos se necessário
    // Por exemplo: logs de auditoria, métricas customizadas, etc.
  }

  /**
   * Registra hooks de segurança (futura implementação)
   */
  static registerSecurityHooks(_app: FastifyInstance): void {
    // Aqui podem ser adicionados hooks para:
    // - Rate limiting
    // - Audit logging
    // - Security headers
  }

  /**
   * Registra hooks de performance (futura implementação)
   */
  static registerPerformanceHooks(_app: FastifyInstance): void {
    // Aqui podem ser adicionados hooks para:
    // - Performance monitoring
    // - Metrics collection
    // - Health check automation
  }

  /**
   * Registra hooks de manutenção automática
   */
  static async registerMaintenanceHooks(app: FastifyInstance): Promise<void> {
    // Importa e registra o hook de limpeza de refresh tokens
    const refreshTokenCleanupHook = await import('./refresh-token-cleanup');
    await app.register(refreshTokenCleanupHook.default);
  }
}
