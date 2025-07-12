import { Invoice, InvoiceStatus } from '../types/app.d';
import { InvoiceRepository } from '../repositories/invoice.repository';

export class InvoiceService {
  private invoiceRepository: InvoiceRepository;

  constructor(invoiceRepository: InvoiceRepository) {
    this.invoiceRepository = invoiceRepository;
  }

  async getReplacementInvoice(tenantId: string, cpf: string, cardNumber: string): Promise<Invoice> {
    // Add business logic validation here
    if (!cpf || cpf.length !== 11) {
      throw new Error('Invalid CPF format');
    }

    return this.invoiceRepository.getReplacementInvoice(tenantId, cpf, cardNumber);
  }

  async getInvoiceStatus(tenantId: string, authorizationPassword: string): Promise<InvoiceStatus> {
    // Add business logic validation here
    if (!authorizationPassword || authorizationPassword.length < 6) {
      throw new Error('Invalid authorization password');
    }

    return this.invoiceRepository.getInvoiceStatus(tenantId, authorizationPassword);
  }
}
