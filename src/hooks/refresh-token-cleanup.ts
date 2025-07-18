import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';

export default fp(async (app: FastifyInstance) => {
  // Hook para limpeza de tokens expirados a cada 1 hora
  const cleanupInterval = setInterval(async () => {
    try {
      await app.refreshTokenService.cleanupExpiredTokens();
      app.log.info('Expired refresh tokens cleaned up successfully');
    } catch (error) {
      app.log.error(
        {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        'Failed to cleanup expired refresh tokens'
      );
    }
  }, 60 * 60 * 1000); // 1 hora

  // Limpar o intervalo quando o servidor for fechado
  app.addHook('onClose', async () => {
    clearInterval(cleanupInterval);
    app.log.info('Refresh token cleanup interval cleared');
  });

  // Executar limpeza inicial
  try {
    await app.refreshTokenService.cleanupExpiredTokens();
    app.log.info('Initial cleanup of expired refresh tokens completed');
  } catch (error) {
    app.log.warn(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      'Initial cleanup of expired refresh tokens failed'
    );
  }
});