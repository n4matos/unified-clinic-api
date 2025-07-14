import { FastifyInstance } from 'fastify';
import { MedicalGuide } from '../types';
import { GuideAgentFactory } from '../agents/GuideAgentFactory';

export class ProfessionalService {
  async getMedicalInvoice(
    tenantId: string,
    networkOption: string,
    app: FastifyInstance
  ): Promise<MedicalGuide[]> {
    if (!networkOption || networkOption.trim().length === 0) {
      throw new Error('Network option is required');
    }

    const agent = GuideAgentFactory.create(tenantId);
    return agent.getMedicalGuide(tenantId, networkOption, app);
  }
}
