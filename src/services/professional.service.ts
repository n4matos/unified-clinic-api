import { FastifyInstance } from 'fastify';
import { MedicalGuide } from '../types';
import { GuideAgentFactory } from '../agents/GuideAgentFactory';
import { LoggerService } from './logger.service';

export class ProfessionalService {
  private logger?: LoggerService;

  constructor(logger?: LoggerService) {
    this.logger = logger;
  }

  async getMedicalInvoice(
    tenantId: string,
    networkOption: string,
    app: FastifyInstance
  ): Promise<MedicalGuide[]> {
    const startTime = Date.now();
    const logger = this.logger?.withTenant(tenantId);

    logger?.business('Fetching medical guide', {
      operation: 'getMedicalInvoice',
      resource: 'medicalGuide',
      tenantId,
      networkOption,
    });

    try {
      const agent = GuideAgentFactory.create(tenantId);
      const result = await agent.getMedicalGuide(tenantId, networkOption, app);

      logger?.business('Medical guide retrieved successfully', {
        operation: 'getMedicalInvoice',
        resource: 'medicalGuide',
        tenantId,
        networkOption,
        duration: Date.now() - startTime,
        success: true,
      });

      return result;
    } catch (error) {
      logger?.error('Failed to fetch medical guide', error as Error, {
        operation: 'getMedicalInvoice',
        resource: 'medicalGuide',
        tenantId,
        networkOption,
        duration: Date.now() - startTime,
      });
      throw error;
    }
  }
}
