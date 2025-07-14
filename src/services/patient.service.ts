import { FastifyInstance } from 'fastify';
import { PatientAgentFactory } from '../agents/PatientAgentFactory';
import { RegistrationData, Invoice, InvoiceStatus } from '../types';
import { LoggerService } from './logger.service';

export class PatientService {
  private logger?: LoggerService;

  constructor(logger?: LoggerService) {
    this.logger = logger;
  }

  async getRegistrationData(
    tenantId: string,
    app: FastifyInstance,
    cpf?: string,
    cardNumber?: string
  ): Promise<RegistrationData | null> {
    const agent = PatientAgentFactory.create(tenantId);
    return agent.getRegistrationData(tenantId, app, cpf, cardNumber);
  }

  async getInvoiceReplacement(
    tenantId: string,
    app: FastifyInstance,
    cpf?: string,
    cardNumber?: string
  ): Promise<Invoice | null> {
    const agent = PatientAgentFactory.create(tenantId);
    return agent.getInvoiceReplacement(tenantId, app, cpf, cardNumber);
  }

  async getGuideStatus(
    tenantId: string,
    app: FastifyInstance,
    authorizationPassword?: string
  ): Promise<InvoiceStatus | null> {
    const agent = PatientAgentFactory.create(tenantId);
    return agent.getGuideStatus(tenantId, app, authorizationPassword);
  }
}
