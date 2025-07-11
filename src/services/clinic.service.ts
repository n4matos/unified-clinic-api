import { HttpError } from '../errors/http.error';
import bcrypt from 'bcryptjs';
import { ClinicRepository } from '../repositories/clinic.repository';
import { ClinicCreate } from '../types/clinic.types';

export class ClinicService {
  private clinicRepository: ClinicRepository;

  constructor(clinicRepository: ClinicRepository) {
    this.clinicRepository = clinicRepository;
  }

  async createClinic(clinicData: Omit<ClinicCreate, 'client_secret'> & { client_secret: string }) {
    const hashedSecret = await bcrypt.hash(clinicData.client_secret, 10);
    const clinicToCreate = {
      name: clinicData.name,
      client_id: clinicData.client_id,
      client_secret: hashedSecret,
    };
    return this.clinicRepository.create(clinicToCreate);
  }

  async validateClinic(clientId: string, clientSecret: string) {
    const clinic = await this.clinicRepository.findByClientId(clientId);
    if (!clinic) {
      throw new HttpError(401, 'Invalid client credentials');
    }

    const isSecretValid = await bcrypt.compare(clientSecret, clinic.client_secret);
    if (!isSecretValid) {
      throw new HttpError(401, 'Invalid client credentials');
    }

    return clinic;
  }
}
