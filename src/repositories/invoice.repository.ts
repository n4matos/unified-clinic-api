import { Invoice, InvoiceStatus, InvoiceStatusType } from '../types/app.d';

export class InvoiceRepository {
  private mockedInvoice: Invoice = {
    barcode: '1234567890123456789012345678901234567890',
    amount: 150.75,
    expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    contractCode: 'CONTRACT-XYZ-123',
  };

  private mockedInvoiceStatuses: InvoiceStatusType[] = ['Authorized', 'Under Audit', 'Denied'];

  async getReplacementInvoice(tenantId: string, cpf: string, cardNumber: string): Promise<Invoice> {
    // In a real scenario, this would query the tenant's database
    // const db = await getDbPool(tenantId);
    // For now, return mocked data
    return Promise.resolve(this.mockedInvoice);
  }

  async getInvoiceStatus(tenantId: string, authorizationPassword: string): Promise<InvoiceStatus> {
    // In a real scenario, this would query the tenant's database
    // const db = await getDbPool(tenantId);
    // For now, return a random mocked status
    const randomStatus =
      this.mockedInvoiceStatuses[Math.floor(Math.random() * this.mockedInvoiceStatuses.length)];
    return Promise.resolve({ status: randomStatus });
  }
}
