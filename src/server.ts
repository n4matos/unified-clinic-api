import 'dotenv/config';
import { buildApp } from './app';

async function start(): Promise<void> {
  const app = await buildApp();
  const PORT = Number(process.env.PORT) || 3000;

  /* graceful shutdown */
  const shutdown = async (signal: string) => {
    app.log.info(`↙️  ${signal} – shutting down`);
    try {
      await app.close();
      app.log.info('✅ HTTP server closed');
      process.exit(0);
    } catch (err) {
      app.log.fatal(err, '❌ Error during shutdown');
      process.exit(1);
    }
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('uncaughtException', (err) => {
    app.log.fatal(err, 'Uncaught Exception');
    shutdown('uncaughtException');
  });
  process.on('unhandledRejection', (reason, promise) => {
    app.log.fatal({ reason, promise }, 'Unhandled Rejection');
    shutdown('unhandledRejection');
  });

  try {
    await app.listen({ port: PORT, host: '0.0.0.0' });
    app.log.info(`🚀  Server ready at http://localhost:${PORT}`);
    app.log.info(`📍 Health check → /health/clinics`);
  } catch (err) {
    app.log.fatal(err, 'Failed to start server');
    process.exit(1);
  }
}

start();
