import { FastifyInstance } from 'fastify';
import { RegistrationData, Invoice, InvoiceStatus } from '../../types/patient.types';

export interface PatientRepository {
  getRegistrationData(
    tenantId: string,
    cpf?: string,
    cardNumber?: string,
    app?: FastifyInstance
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
