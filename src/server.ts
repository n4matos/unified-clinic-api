import { buildApp } from './app';

async function start() {
  const app = buildApp();
  const PORT = process.env.PORT ?? 3000;

  try {
    await app.listen({ port: Number(PORT), host: '0.0.0.0' });
    app.log.info(`HTTP server listening on port ${PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
