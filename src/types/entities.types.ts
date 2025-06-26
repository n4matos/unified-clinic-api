export interface Patient {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  dateOfBirth?: Date;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId?: string;
  date: Date;
  duration: number; // in minutes
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Doctor {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  specialty?: string;
  crm?: string;
  createdAt: Date;
  updatedAt: Date;
}
