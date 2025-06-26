import { Pool } from 'pg';
import { Patient } from '../types/entities.types';
import { PatientRepository } from '../repositories/patient.repository';

export class PatientService {
  constructor(private repository: PatientRepository) {}

  async getAll(pool: Pool): Promise<Patient[]> {
    return this.repository.findAll(pool);
  }

  async getById(pool: Pool, id: string): Promise<Patient | null> {
    return this.repository.findById(pool, id);
  }

  async create(
    pool: Pool,
    data: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Patient> {
    return this.repository.create(pool, data);
  }

  async update(
    pool: Pool,
    id: string,
    data: Partial<Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<Patient | null> {
    return this.repository.update(pool, id, data);
  }

  async delete(pool: Pool, id: string): Promise<void> {
    return this.repository.delete(pool, id);
  }
}
