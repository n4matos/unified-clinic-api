import { DbPool } from '../types/db.types';
import { Patient } from '../types/entities.types';

export class PatientRepository {
  async findAll(db: DbPool): Promise<Patient[]> {
    return db('patients').select<Patient[]>();
  }

  async findById(db: DbPool, id: string): Promise<Patient | null> {
    return db('patients').where({ id }).first<Patient>();
  }

  async create(
    db: DbPool,
    patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Patient> {
    if (db.type === 'mysql') {
      const [insertId] = await db('patients').insert(patient);
      return db('patients').where({ id: insertId }).first<Patient>();
    } else {
      const [createdPatient] = await db('patients').insert(patient).returning('*');
      return createdPatient;
    }
  }

  async update(
    db: DbPool,
    id: string,
    patient: Partial<Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<Patient | null> {
    if (db.type === 'mysql') {
      await db('patients').where({ id }).update(patient);
      return db('patients').where({ id }).first<Patient>();
    } else {
      const [updatedPatient] = await db('patients').where({ id }).update(patient).returning('*');
      return updatedPatient;
    }
  }

  async delete(db: DbPool, id: string): Promise<void> {
    await db('patients').where({ id }).del();
  }
}
