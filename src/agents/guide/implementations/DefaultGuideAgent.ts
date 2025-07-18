import { FastifyInstance } from 'fastify';
import { GuideAgent } from '../GuideAgent';
import { GuideRepository } from '../../../repositories/guide/GuideRepository';
import { SqlServerGuideRepository } from '../../../repositories/guide/implementations/SqlServerGuideRepository';
import { MedicalGuidePaginatedResponse } from '../../../types';
import { HttpError } from '../../../errors/http.error';

export class DefaultGuideAgent implements GuideAgent {
  private guideRepository: GuideRepository;

  constructor() {
    this.guideRepository = new SqlServerGuideRepository();
  }

  async getMedicalGuide(
    _tenantId: string,
    networkOption: string,
    page: number = 1,
    limit: number = 10,
    _app?: FastifyInstance
  ): Promise<MedicalGuidePaginatedResponse> {
    if (!networkOption || networkOption.trim().length === 0) {
      throw new HttpError(400, 'Network option is required', 'Bad Request');
    }
    return this.guideRepository.getMedicalGuide(_tenantId, networkOption, page, limit, _app);
  }
}
