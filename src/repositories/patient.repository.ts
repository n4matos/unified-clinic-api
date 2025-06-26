import { DbPool } from '../types/db.types';
import { Patient } from '../types/entities.types';

export class PatientRepository {
  async findAll(pool: DbPool): Promise<Patient[]> {
    const result = await pool.query('SELECT * FROM patients');
    return result.rows;
  }

  async findById(pool: DbPool, id: string): Promise<Patient | null> {
    const result = await pool.query('SELECT * FROM patients WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  async create(
    pool: DbPool,
    patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Patient> {
    const result = await pool.query(
      `INSERT INTO patients (name, email, phone, date_of_birth, address, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING *`,
      [patient.name, patient.email, patient.phone, patient.dateOfBirth, patient.address],
    );
    return result.rows[0];
  }

  async update(
    pool: DbPool,
    id: string,
    patient: Partial<Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<Patient | null> {
    const fields = Object.keys(patient);
    if (fields.length === 0) return null;
    const setClause = fields.map((f, i) => `${f} = $${i + 2}`).join(', ');
    const values = fields.map((f) => (patient as any)[f]);
    const result = await pool.query(
      `UPDATE patients SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id, ...values],
    );
    return result.rows[0] || null;
  }

  async delete(pool: DbPool, id: string): Promise<void> {
    await pool.query('DELETE FROM patients WHERE id = $1', [id]);
  }
}
