import { Knex } from 'knex';
import { Clinic, ClinicCreate } from '../types/clinic.types';

export class ClinicRepository {
  private db: Knex;

  constructor(db: Knex) {
    this.db = db;
  }

  async findByClientId(clientId: string): Promise<Clinic | undefined> {
    return this.db('clinics').where({ client_id: clientId }).first<Clinic>();
  }

  async create(clinic: ClinicCreate): Promise<Clinic> {
    const [createdClinic] = await this.db('clinics').insert(clinic).returning('*');
    return createdClinic;
  }

  async findById(clinicId: string): Promise<Clinic | undefined> {
    return this.db('clinics').where({ clinic_id: clinicId }).first<Clinic>();
  }
}
