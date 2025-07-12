// Types related to patient operations

export interface Address {
  type: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface Phone {
  type: string;
  number: string;
}

export interface RegistrationData {
  activeAddress?: Address;
  activePhones: Phone[];
  email?: string;
}

export interface Invoice {
  barcode: string;
  amount: number;
  expirationDate: string;
  contractCode: string;
}

export type InvoiceStatusType = 'Authorized' | 'Under Audit' | 'Denied';

export interface InvoiceStatus {
  status: InvoiceStatusType;
}
