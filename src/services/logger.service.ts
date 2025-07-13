import { FastifyBaseLogger } from 'fastify';

/**
 * Enum para níveis de log padronizados
 */
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

/**
 * Interface para contexto de log estruturado
 */
export interface LogContext {
  tenantId?: string;
  clientId?: string;
  requestId?: string;
  userId?: string;
  operationType?: string;
  correlationId?: string;
  [key: string]: unknown;
}

/**
 * Interface para log de operações de business
 */
export interface BusinessLogContext extends LogContext {
  operation: string;
  resource?: string;
  resourceId?: string;
  duration?: number;
  success?: boolean;
}

/**
 * Interface para log de erros estruturados
 */
export interface ErrorLogContext extends LogContext {
  error: {
    type: string;
    message: string;
    code?: string;
    statusCode?: number;
    stack?: string;
  };
  context?: {
    method?: string;
    url?: string;
    headers?: Record<string, unknown>;
    body?: unknown;
  };
}

/**
 * Serviço centralizado de logging com suporte a multi-tenancy
 * Fornece logs estruturados e correlação entre requests
 */
export class LoggerService {
  private baseLogger: FastifyBaseLogger;
  private defaultContext: LogContext;

  constructor(baseLogger: FastifyBaseLogger, defaultContext: LogContext = {}) {
    this.baseLogger = baseLogger;
    this.defaultContext = defaultContext;
  }

  /**
   * Cria uma nova instância com contexto adicional
   */
  withContext(context: LogContext): LoggerService {
    return new LoggerService(this.baseLogger, {
      ...this.defaultContext,
      ...context,
    });
  }

  /**
   * Cria uma nova instância com contexto de tenant
   */
  withTenant(tenantId: string, clientId?: string): LoggerService {
    return this.withContext({ tenantId, clientId });
  }

  /**
   * Log de informação geral
   */
  info(message: string, context?: LogContext): void {
    this.log(LogLevel.INFO, message, context);
  }

  /**
   * Log de erro
   */
  error(message: string, error?: Error | ErrorLogContext, context?: LogContext): void {
    let errorContext: ErrorLogContext;

    if (error instanceof Error) {
      errorContext = {
        ...this.defaultContext,
        ...context,
        error: {
          type: error.constructor.name,
          message: error.message,
          stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined,
        },
      };
    } else if (error && typeof error === 'object') {
      errorContext = { ...this.defaultContext, ...context, ...error };
    } else {
      errorContext = { ...this.defaultContext, ...context } as ErrorLogContext;
    }

    this.baseLogger.error(errorContext, message);
  }

  /**
   * Log de warning
   */
  warn(message: string, context?: LogContext): void {
    this.log(LogLevel.WARN, message, context);
  }

  /**
   * Log de debug (apenas em desenvolvimento)
   */
  debug(message: string, context?: LogContext): void {
    if (process.env.NODE_ENV !== 'production') {
      this.log(LogLevel.DEBUG, message, context);
    }
  }

  /**
   * Log de operações de business com métricas
   */
  business(message: string, context: BusinessLogContext): void {
    const enhancedContext = {
      ...this.defaultContext,
      ...context,
      timestamp: new Date().toISOString(),
      level: 'business',
    };

    this.baseLogger.info(enhancedContext, `[BUSINESS] ${message}`);
  }

  /**
   * Log de auditoria para operações críticas
   */
  audit(message: string, context: LogContext & { action: string; resource: string }): void {
    const auditContext = {
      ...this.defaultContext,
      ...context,
      timestamp: new Date().toISOString(),
      level: 'audit',
    };

    this.baseLogger.info(auditContext, `[AUDIT] ${message}`);
  }

  /**
   * Log de performance para monitoramento
   */
  performance(
    message: string,
    context: LogContext & { duration: number; operation: string }
  ): void {
    const perfContext = {
      ...this.defaultContext,
      ...context,
      timestamp: new Date().toISOString(),
      level: 'performance',
    };

    this.baseLogger.info(perfContext, `[PERF] ${message}`);
  }

  /**
   * Método interno para logging
   */
  private log(level: LogLevel, message: string, context?: LogContext): void {
    const logContext = {
      ...this.defaultContext,
      ...context,
      timestamp: new Date().toISOString(),
    };

    this.baseLogger[level](logContext, message);
  }

  /**
   * Cria um child logger para escopo específico
   */
  child(context: LogContext): LoggerService {
    const childLogger = this.baseLogger.child(context);
    return new LoggerService(childLogger, { ...this.defaultContext, ...context });
  }
}

/**
 * Factory para criar LoggerService
 */
export function createLogger(baseLogger: FastifyBaseLogger, context?: LogContext): LoggerService {
  return new LoggerService(baseLogger, context);
}


