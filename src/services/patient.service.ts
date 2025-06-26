import { Patient } from '../types/entities.types';
import { PatientRepository } from '../repositories/patient.repository';

export class PatientService {
  constructor(private repository: PatientRepository) {}

  async getAll(): Promise<Patient[]> {
    return this.repository.findAll();
  }

  async getById(id: string): Promise<Patient | null> {
    return this.repository.findById(id);
  }

  async create(data: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Promise<Patient> {
    return this.repository.create(data);
  }

  async update(
    id: string,
    data: Partial<Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<Patient | null> {
    return this.repository.update(id, data);
  }

  async delete(id: string): Promise<void> {
    return this.repository.delete(id);
  }
}
