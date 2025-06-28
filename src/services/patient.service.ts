import { DbPool } from '../types/db.types';
import { Patient } from '../types/patient.types';
import { PatientRepository } from '../repositories/patient.repository';

export class PatientService {
  constructor(private repository: PatientRepository) {}

  async getAll(pool: DbPool): Promise<Patient[]> {
    return this.repository.findAll(pool);
  }

  async getById(pool: DbPool, id: string): Promise<Patient | null> {
    return this.repository.findById(pool, id);
  }

  async create(
    pool: DbPool,
    data: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Patient> {
    return this.repository.create(pool, data);
  }

  async update(
    pool: DbPool,
    id: string,
    data: Partial<Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<Patient | null> {
    return this.repository.update(pool, id, data);
  }

  async delete(pool: DbPool, id: string): Promise<void> {
    return this.repository.delete(pool, id);
  }
}
