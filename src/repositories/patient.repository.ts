import { RegistrationData, Invoice, InvoiceStatus } from '../types/patient.types';

export class PatientRepository {
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
    // Mock data - em produção, faria consulta no banco de dados do tenant
    return {
      activeAddress: {
        type: 'Residential',
        street: 'Rua das Flores',
        number: '123',
        complement: 'Apto 101',
        neighborhood: 'Jardim Primavera',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234-567',
      },
      activePhones: [
        {
          type: 'Mobile',
          number: '+55 11 99999-8888',
        },
        {
          type: 'Home',
          number: '+55 11 2222-3333',
        },
      ],
      email: `${cpf}.${cardNumber}@example.com`,
    };
  }

  /**
   * Segunda via de boleto
   * @param tenantId - ID do tenant
   * @param cpf - CPF do paciente
   * @param cardNumber - Número da carteirinha
   * @returns Dados da fatura
   */
  async getInvoiceReplacement(tenantId: string, cpf: string, cardNumber: string): Promise<Invoice> {
    // Mock data - em produção, faria consulta no banco de dados do tenant
    return {
      barcode: '23791.12345 67890.123456 78901.234567 1 98765432101234',
      amount: 150.75,
      expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 dias
      contractCode: `CNT-${tenantId}-${cpf.slice(-4)}`,
    };
  }

  /**
   * Status da guia
   * @param tenantId - ID do tenant
   * @param authorizationPassword - Senha de autorização
   * @returns Status da guia
   */
  async getGuideStatus(tenantId: string, authorizationPassword: string): Promise<InvoiceStatus> {
    // Mock data - em produção, faria consulta no banco de dados do tenant
    const statuses: InvoiceStatus['status'][] = ['Authorized', 'Under Audit', 'Denied'];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

    return {
      status: randomStatus,
    };
  }
}
