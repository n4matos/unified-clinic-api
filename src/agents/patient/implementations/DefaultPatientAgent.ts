import { FastifyInstance } from 'fastify';
import { PatientAgent } from '../PatientAgent';
import { PatientRepository } from '../../../repositories/patient/PatientRepository';
import { SqlServerPatientRepository } from '../../../repositories/patient/implementations/SqlServerPatientRepository';
import { RegistrationData, Invoice, InvoiceStatus } from '../../../types';
import { HttpError } from '../../../errors/http.error';

export class DefaultPatientAgent implements PatientAgent {
  private patientRepository: PatientRepository;

  constructor() {
    this.patientRepository = new SqlServerPatientRepository();
  }

  async getRegistrationData(
    tenantId: string,
    app: FastifyInstance,
    cpf?: string,
    cardNumber?: string
  ): Promise<RegistrationData> {
    if (!cpf && !cardNumber) {
      throw new HttpError(400, 'Pelo menos um dos campos deve ser informado: cpf ou cardNumber');
    }
    const result = await this.patientRepository.getRegistrationData(
      tenantId,
      cpf,
      cardNumber,
      app
    );
    if (!result) {
      throw new HttpError(404, 'Dados cadastrais não encontrados.');
    }
    return result;
  }

  async getInvoiceReplacement(
    tenantId: string,
    app: FastifyInstance,
    cpf?: string,
    cardNumber?: string
  ): Promise<Invoice> {
    const result = await this.patientRepository.getInvoiceReplacement(
      tenantId,
      app,
      cpf,
      cardNumber
    );
    if (!result) {
      throw new HttpError(404, 'Segunda via de boleto não encontrada.');
    }
    return result;
  }

  async getGuideStatus(
    tenantId: string,
    app: FastifyInstance,
    authorizationPassword?: string
  ): Promise<InvoiceStatus> {
    const result = await this.patientRepository.getGuideStatus(
      tenantId,
      app,
      authorizationPassword
    );
    if (!result) {
      throw new HttpError(404, 'Status da guia não encontrado.');
    }
    return result;
  }
}