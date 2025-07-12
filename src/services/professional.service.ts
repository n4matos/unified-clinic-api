import { Professional } from '../types/app.d';
import { ProfessionalRepository } from '../repositories/professional.repository';

export class ProfessionalService {
  private professionalRepository: ProfessionalRepository;

  constructor(professionalRepository: ProfessionalRepository) {
    this.professionalRepository = professionalRepository;
  }

  async getMedicalInvoice(tenantId: string, networkOption: string): Promise<Professional[]> {
    // Add business logic validation here
    if (!networkOption || networkOption.trim().length === 0) {
      throw new Error('Network option is required');
    }

    return this.professionalRepository.getProfessionalsByNetworkOption(tenantId, networkOption);
  }
}
