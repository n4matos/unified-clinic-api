import { FastifyInstance } from 'fastify';
import { RegistrationData, Invoice, InvoiceStatus } from '../../types';

export interface PatientAgent {
  getRegistrationData(
    tenantId: string,
    app: FastifyInstance,
    cpf?: string,
    cardNumber?: string
  ): Promise<RegistrationData>;

  getInvoiceReplacement(
    tenantId: string,
    app: FastifyInstance,
    cpf?: string,
    cardNumber?: string
  ): Promise<Invoice>;

  getGuideStatus(
    tenantId: string,
    app: FastifyInstance,
    authorizationPassword?: string
  ): Promise<InvoiceStatus>;
}
