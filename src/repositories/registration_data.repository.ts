import { RegistrationData } from '../types/app.d';

export class RegistrationDataRepository {
  private mockedRegistrationData: RegistrationData = {
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
    email: 'mock.user@example.com',
  };

  async getRegistrationData(
    cpf: string,
    cardNumber: string,
    tenantId: string
  ): Promise<RegistrationData> {
    console.log(tenantId);
    // In a real scenario, this would query a database using the tenantId
    // For now, return mocked data
    return Promise.resolve(this.mockedRegistrationData);
  }
}
