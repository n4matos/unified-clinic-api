import { buildApp } from './app';
import { FastifyInstance } from 'fastify';

async function start() {
  let app: FastifyInstance | undefined;
  try {
    app = await buildApp();
    const PORT = process.env.PORT ?? 3000;

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      if (app) {
        app.log.info(`Received ${signal}, starting graceful shutdown...`);

        try {
          // Parar de aceitar novas conexões
          await app.close();
          app.log.info('✅ HTTP server closed');

          app.log.info('✅ Graceful shutdown completed');
          process.exit(0);
        } catch (error) {
          app.log.error('❌ Error during graceful shutdown:', error);
          process.exit(1);
        }
      } else {
        console.error(`Received ${signal}, but app was not initialized.`);
        process.exit(1);
      }
    };

    // Registrar handlers para sinais de shutdown
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handler para erros não capturados
    process.on('uncaughtException', (error) => {
      if (app) {
        app.log.fatal('Uncaught Exception:', error);
      } else {
        console.error('Uncaught Exception before app initialized:', error);
      }
      gracefulShutdown('uncaughtException');
    });

    process.on('unhandledRejection', (reason, promise) => {
      if (app) {
        app.log.fatal('Unhandled Rejection at:', promise, 'reason:', reason);
      } else {
        console.error('Unhandled Rejection before app initialized:', reason, promise);
      }
      gracefulShutdown('unhandledRejection');
    });

    try {
      await app.listen({ port: Number(PORT), host: '0.0.0.0' });
      app.log.info(`🚀 HTTP server listening on port ${PORT}`);
      app.log.info(`📍 Health check available at: http://localhost:${PORT}/health/clinics`);
    } catch (err) {
      app.log.error('Failed to start server:', err);
      process.exit(1);
    }
  } catch (err) {
    if (app) {
      app.log.fatal('Error during application startup:', err);
    } else {
      console.error('Error during application startup (app not initialized):', err);
    }
    process.exit(1);
  }
}

start();
