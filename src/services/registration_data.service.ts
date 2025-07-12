import { RegistrationData } from '../types/app.d';
import { RegistrationDataRepository } from '../repositories/registration_data.repository';

export class RegistrationDataService {
  private registrationDataRepository: RegistrationDataRepository;

  constructor(registrationDataRepository: RegistrationDataRepository) {
    this.registrationDataRepository = registrationDataRepository;
  }

  async getRegistrationData(
    tenantId: string,
    cpf: string,
    cardNumber: string
  ): Promise<RegistrationData> {
    // Add business logic validation here
    if (!cpf || cpf.length !== 11) {
      throw new Error('Invalid CPF format');
    }

    if (!cardNumber || cardNumber.trim().length === 0) {
      throw new Error('Card number is required');
    }

    return this.registrationDataRepository.getRegistrationData(tenantId, cpf, cardNumber);
  }
}
