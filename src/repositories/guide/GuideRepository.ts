import { FastifyInstance } from 'fastify';
import { MedicalGuide } from '../../types/guide.types';

export interface GuideRepository {
  getMedicalGuide(
    tenantId: string,
    networkOption: string,
    app?: FastifyInstance
  ): Promise<MedicalGuide[]>;
}
