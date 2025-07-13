import { PatientRepository } from '../repositories/patient.repository';
import { RegistrationData, Invoice, InvoiceStatus } from '../types/patient.types';
import { LoggerService, createLogger, maskSensitiveData } from './logger.service';

export class PatientService {
  private patientRepository: PatientRepository;
  private logger?: LoggerService;

  constructor(logger?: LoggerService) {
    this.patientRepository = new PatientRepository();
    this.logger = logger;
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
    const startTime = Date.now();
    const logger = this.logger?.withTenant(tenantId);
    
    logger?.business('Fetching patient registration data', {
      operation: 'getRegistrationData',
      resource: 'patient',
      resourceId: maskSensitiveData(cpf),
      tenantId,
    });

    try {
      const result = await this.patientRepository.getRegistrationData(tenantId, cpf, cardNumber);
      
      logger?.business('Patient registration data retrieved successfully', {
        operation: 'getRegistrationData',
        resource: 'patient',
        resourceId: maskSensitiveData(cpf),
        tenantId,
        duration: Date.now() - startTime,
        success: true,
      });

      return result;
    } catch (error) {
      logger?.error('Failed to fetch patient registration data', error as Error, {
        operation: 'getRegistrationData',
        resource: 'patient',
        resourceId: maskSensitiveData(cpf),
        tenantId,
        duration: Date.now() - startTime,
      });
      throw error;
    }
  }

  /**
   * Segunda via de boleto
   * @param tenantId - ID do tenant
   * @param cpf - CPF do paciente
   * @param cardNumber - Número da carteirinha
   * @returns Dados da fatura
   */
  async getInvoiceReplacement(tenantId: string, cpf: string, cardNumber: string): Promise<Invoice> {
    const startTime = Date.now();
    const logger = this.logger?.withTenant(tenantId);
    
    logger?.business('Generating invoice replacement', {
      operation: 'getInvoiceReplacement',
      resource: 'invoice',
      resourceId: maskSensitiveData(cpf),
      tenantId,
    });

    try {
      const result = await this.patientRepository.getInvoiceReplacement(tenantId, cpf, cardNumber);
      
      logger?.business('Invoice replacement generated successfully', {
        operation: 'getInvoiceReplacement',
        resource: 'invoice',
        resourceId: maskSensitiveData(cpf),
        tenantId,
        duration: Date.now() - startTime,
        success: true,
      });

      return result;
    } catch (error) {
      logger?.error('Failed to generate invoice replacement', error as Error, {
        operation: 'getInvoiceReplacement',
        resource: 'invoice',
        resourceId: maskSensitiveData(cpf),
        tenantId,
        duration: Date.now() - startTime,
      });
      throw error;
    }
  }

  /**
   * Status da guia
   * @param tenantId - ID do tenant
   * @param authorizationPassword - Senha de autorização
   * @returns Status da guia
   */
  async getGuideStatus(tenantId: string, authorizationPassword: string): Promise<InvoiceStatus> {
    const startTime = Date.now();
    const logger = this.logger?.withTenant(tenantId);
    
    logger?.business('Checking guide status', {
      operation: 'getGuideStatus',
      resource: 'guide',
      tenantId,
    });

    try {
      const result = await this.patientRepository.getGuideStatus(tenantId, authorizationPassword);
      
      logger?.business('Guide status retrieved successfully', {
        operation: 'getGuideStatus',
        resource: 'guide',
        tenantId,
        duration: Date.now() - startTime,
        success: true,
      });

      return result;
    } catch (error) {
      logger?.error('Failed to check guide status', error as Error, {
        operation: 'getGuideStatus',
        resource: 'guide',
        tenantId,
        duration: Date.now() - startTime,
      });
      throw error;
    }
  }
}
