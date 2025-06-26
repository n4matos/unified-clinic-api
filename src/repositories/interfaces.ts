import { Patient, Appointment, Doctor } from '../types/index.js';

export interface IPatientRepository {
  findAll(): Promise<Patient[]>;
  findById(id: string): Promise<Patient | null>;
  create(patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Promise<Patient>;
  update(id: string, patient: Partial<Patient>): Promise<Patient | null>;
  delete(id: string): Promise<boolean>;
}

export interface IAppointmentRepository {
  findAll(): Promise<Appointment[]>;
  findById(id: string): Promise<Appointment | null>;
  findByPatientId(patientId: string): Promise<Appointment[]>;
  findByDate(date: Date): Promise<Appointment[]>;
  create(appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Appointment>;
  update(id: string, appointment: Partial<Appointment>): Promise<Appointment | null>;
  delete(id: string): Promise<boolean>;
}

export interface IDoctorRepository {
  findAll(): Promise<Doctor[]>;
  findById(id: string): Promise<Doctor | null>;
  create(doctor: Omit<Doctor, 'id' | 'createdAt' | 'updatedAt'>): Promise<Doctor>;
  update(id: string, doctor: Partial<Doctor>): Promise<Doctor | null>;
  delete(id: string): Promise<boolean>;
}
