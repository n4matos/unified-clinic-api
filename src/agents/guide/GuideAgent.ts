import { FastifyInstance } from 'fastify';
import { MedicalGuide } from '../../types';

export interface GuideAgent {
  getMedicalGuide(
    tenantId: string,
    networkOption: string,
    app?: FastifyInstance
  ): Promise<MedicalGuide[]>;
}