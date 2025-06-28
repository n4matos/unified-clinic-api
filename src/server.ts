import { buildApp } from './app';

async function start() {
  try {
    const app = buildApp();
    const PORT = process.env.PORT ?? 3000;

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
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
    };

    // Registrar handlers para sinais de shutdown
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handler para erros não capturados
    process.on('uncaughtException', (error) => {
      app.log.fatal('Uncaught Exception:', error);
      gracefulShutdown('uncaughtException');
    });

    process.on('unhandledRejection', (reason, promise) => {
      app.log.fatal('Unhandled Rejection at:', promise, 'reason:', reason);
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
    console.error('Error during application startup:', err);
    process.exit(1);
  }
}

start();