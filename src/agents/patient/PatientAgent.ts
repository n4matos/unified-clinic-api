import { FastifyInstance } from 'fastify';
import { RegistrationData, Invoice, InvoiceStatus } from '../../types';

export interface PatientAgent {
  getRegistrationData(
    tenantId: string,
    app: FastifyInstance,
    cpf?: string,
    cardNumber?: string
  ): Promise<RegistrationData | null>;

  getInvoiceReplacement(
    tenantId: string,
    app: FastifyInstance,
    cpf?: string,
    cardNumber?: string
  ): Promise<Invoice | null>;

  getGuideStatus(
    tenantId: string,
    app: FastifyInstance,
    authorizationPassword?: string
  ): Promise<InvoiceStatus | null>;
}