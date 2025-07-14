import { FastifyInstance } from 'fastify';
import { GuideAgent } from '../GuideAgent';
import { ProfessionalRepository } from '../../../repositories/professional.repository';
import { MedicalGuide } from '../../../types';

export class DefaultGuideAgent implements GuideAgent {
  private professionalRepository: ProfessionalRepository;

  constructor() {
    this.professionalRepository = new ProfessionalRepository();
  }

  async getMedicalGuide(
    tenantId: string,
    networkOption: string,
    app?: FastifyInstance
  ): Promise<MedicalGuide[]> {
    return this.professionalRepository.getMedicalInvoice(
      tenantId,
      networkOption,
      app
    );
  }
}