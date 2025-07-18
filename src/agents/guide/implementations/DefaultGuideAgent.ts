import { FastifyInstance } from 'fastify';
import { GuideAgent } from '../GuideAgent';
import { GuideRepository } from '../../../repositories/guide/GuideRepository';
import { SqlServerGuideRepository } from '../../../repositories/guide/implementations/SqlServerGuideRepository';
import { MedicalGuidePaginatedResponse } from '../../../types';

export class DefaultGuideAgent implements GuideAgent {
  private guideRepository: GuideRepository;

  constructor(guideRepository?: GuideRepository) {
    this.guideRepository = guideRepository || new SqlServerGuideRepository();
  }

  async getMedicalGuide(
    tenantId: string,
    networkOption: string,
    page: number = 1,
    limit: number = 10,
    app?: FastifyInstance
  ): Promise<MedicalGuidePaginatedResponse> {
    return this.guideRepository.getMedicalGuide(tenantId, networkOption, page, limit, app);
  }
}
