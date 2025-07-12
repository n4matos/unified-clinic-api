export interface AppConfig {
  logger: boolean | object; // Usar object para compatibilidade com Fastify
  port: number;
  environment: string;
}

export const createAppConfig = (): AppConfig => {
  const isProd = process.env.NODE_ENV === 'production';
  const port = Number(process.env.PORT) || 3000;
  const environment = process.env.NODE_ENV || 'development';

  const logger: boolean | object = isProd
    ? {
        level: 'info',
        base: undefined,
        timestamp: true,
      }
    : {
        level: 'debug',
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss',
            ignore: 'pid,hostname',
          },
        },
      };

  return {
    logger,
    port,
    environment,
  };
};
