import { PatientRepository } from '../repositories/patient.repository';
import { RegistrationData, Invoice, InvoiceStatus } from '../types/patient.types';

export class PatientService {
  private patientRepository: PatientRepository;

  constructor() {
    this.patientRepository = new PatientRepository();
  }

  /**
   * Consulta de dados cadastrais
   * @param tenantId - ID do tenant
   * @param cpf - CPF do paciente
   * @param cardNumber - Número da carteirinha
   * @returns Dados cadastrais do paciente
   */
  async getRegistrationData(
    tenantId: string,
    cpf: string,
    cardNumber: string
  ): Promise<RegistrationData> {
    return this.patientRepository.getRegistrationData(tenantId, cpf, cardNumber);
  }

  /**
   * Segunda via de boleto
   * @param tenantId - ID do tenant
   * @param cpf - CPF do paciente
   * @param cardNumber - Número da carteirinha
   * @returns Dados da fatura
   */
  async getInvoiceReplacement(tenantId: string, cpf: string, cardNumber: string): Promise<Invoice> {
    return this.patientRepository.getInvoiceReplacement(tenantId, cpf, cardNumber);
  }

  /**
   * Status da guia
   * @param tenantId - ID do tenant
   * @param authorizationPassword - Senha de autorização
   * @returns Status da guia
   */
  async getGuideStatus(tenantId: string, authorizationPassword: string): Promise<InvoiceStatus> {
    return this.patientRepository.getGuideStatus(tenantId, authorizationPassword);
  }
}
