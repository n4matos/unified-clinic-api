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
