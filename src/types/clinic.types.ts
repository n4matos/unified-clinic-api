export interface Clinic {
  clinic_id: string;
  name: string;
  client_id: string;
  client_secret: string;
  created_at: Date;
  updated_at: Date;
}

export interface ClinicCreate {
  name: string;
  client_id: string;
  client_secret: string;
}
