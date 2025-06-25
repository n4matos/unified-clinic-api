export class ClinicRepository {
  private readonly connections = Array.from({ length: 6 }).map((_, i) => ({
    id: i + 1,
    connected: true,
  }));

  async pingAll(): Promise<boolean> {
    // Aqui você abriria conexões reais (e.g., via Prisma, Knex, etc.)
    return this.connections.every((c) => c.connected);
  }
}
