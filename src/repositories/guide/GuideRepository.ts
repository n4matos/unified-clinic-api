import { FastifyInstance } from 'fastify';
import { MedicalGuidePaginatedResponse } from '../../types/guide.types';

export interface GuideRepository {
  getMedicalGuide(
    tenantId: string,
    networkOption: string,
    page: number,
    limit: number,
    app?: FastifyInstance
  ): Promise<MedicalGuidePaginatedResponse>;
}
