import { FastifyInstance } from 'fastify';

export class HookRegistry {
  /**
   * Registra hooks de logging e monitoramento
   */
  static registerLoggingHooks(app: FastifyInstance): void {
    // Hook para log de conclusão de requisição
    app.addHook('onResponse', (req, rep, done) => {
      req.log.info(
        {
          statusCode: rep.statusCode,
          resTime: `${rep.elapsedTime.toFixed(1)}ms`,
        },
        'request completed'
      );
      done();
    });
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
}
