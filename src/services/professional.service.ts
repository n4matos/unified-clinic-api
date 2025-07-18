import { FastifyInstance } from 'fastify';
import { MedicalGuidePaginatedResponse } from '../types';
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
    page: number = 1,
    limit: number = 10,
    app: FastifyInstance
  ): Promise<MedicalGuidePaginatedResponse> {
    const startTime = Date.now();
    const logger = this.logger?.withTenant(tenantId);

    logger?.business('Fetching medical guide', {
      operation: 'getMedicalInvoice',
      resource: 'medicalGuide',
      tenantId,
      networkOption,
      page,
      limit,
    });

    try {
      const agent = GuideAgentFactory.create(tenantId);
      const result = await agent.getMedicalGuide(tenantId, networkOption, page, limit, app);

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
