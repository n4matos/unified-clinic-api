import { FastifyInstance } from 'fastify';
import { PatientAgent } from '../PatientAgent';
import { PatientRepository } from '../../../repositories/patient.repository';
import { RegistrationData, Invoice, InvoiceStatus } from '../../../types';

export class DefaultPatientAgent implements PatientAgent {
  private patientRepository: PatientRepository;

  constructor() {
    this.patientRepository = new PatientRepository();
  }

  async getRegistrationData(
    tenantId: string,
    app: FastifyInstance,
    cpf?: string,
    cardNumber?: string
  ): Promise<RegistrationData | null> {
    return this.patientRepository.getRegistrationData(
      tenantId,
      cpf,
      cardNumber,
      app
    );
  }

  async getInvoiceReplacement(
    tenantId: string,
    app: FastifyInstance,
    cpf?: string,
    cardNumber?: string
  ): Promise<Invoice | null> {
    return this.patientRepository.getInvoiceReplacement(
      tenantId,
      app,
      cpf,
      cardNumber
    );
  }

  async getGuideStatus(
    tenantId: string,
    app: FastifyInstance,
    authorizationPassword?: string
  ): Promise<InvoiceStatus | null> {
    return this.patientRepository.getGuideStatus(
      tenantId,
      app,
      authorizationPassword
    );
  }
}