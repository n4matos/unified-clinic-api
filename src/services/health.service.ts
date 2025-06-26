export class HealthService {
  async status(): Promise<{
    status: 'ok' | 'degraded' | 'down';
    timestamp: string;
    database: 'connected' | 'disconnected';
  }> {
    // Simples health check - depois implementaremos checagem real do banco
    const dbConnected = true; // TODO: implementar checagem real

    return {
      status: dbConnected ? 'ok' : 'down',
      timestamp: new Date().toISOString(),
      database: dbConnected ? 'connected' : 'disconnected',
    };
  }
}
