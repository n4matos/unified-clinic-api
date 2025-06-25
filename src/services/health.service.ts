import { ClinicRepository } from '../repositories/clinic.repository';

export class HealthService {
  constructor(private readonly repo = new ClinicRepository()) {}

  async status(): Promise<string> {
    // Checa conexão com as 6 bases.
    const ok = await this.repo.pingAll();
    return ok ? 'ok' : 'degraded';
  }
}
