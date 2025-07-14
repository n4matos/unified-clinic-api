import { FastifyInstance } from 'fastify';
import { GuideAgent } from '../GuideAgent';
import { GuideRepository } from '../../../repositories/guide/GuideRepository';
import { MockGuideRepository } from '../../../repositories/guide/implementations/MockGuideRepository';
import { MedicalGuide } from '../../../types';
import { HttpError } from '../../../errors/http.error';

export class DefaultGuideAgent implements GuideAgent {
  private guideRepository: GuideRepository;

  constructor() {
    this.guideRepository = new MockGuideRepository();
  }

  async getMedicalGuide(
    _tenantId: string,
    networkOption: string,
    _app?: FastifyInstance
  ): Promise<MedicalGuide[]> {
    if (!networkOption || networkOption.trim().length === 0) {
      throw new HttpError(400, 'Network option is required', 'Bad Request');
    }
    return this.guideRepository.getMedicalGuide(_tenantId, networkOption, _app);
  }
}