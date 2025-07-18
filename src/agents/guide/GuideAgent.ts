import { FastifyInstance } from 'fastify';
import { MedicalGuidePaginatedResponse } from '../../types';

export interface GuideAgent {
  getMedicalGuide(
    tenantId: string,
    networkOption: string,
    page?: number,
    limit?: number,
    app?: FastifyInstance
  ): Promise<MedicalGuidePaginatedResponse>;
}
