// Types related to medical guide operations
import { Address, Phone } from './patient.types';

export interface MedicalGuide {
  name: string;
  specialty: string;
  address: Address;
  phone: Phone;
}

export interface PaginationMetadata {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface MedicalGuidePaginatedResponse {
  data: MedicalGuide[];
  pagination: PaginationMetadata;
}
