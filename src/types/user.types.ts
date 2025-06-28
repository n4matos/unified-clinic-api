export interface User {
  id: string;
  username: string;
  password_hash: string;
  clinic_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface UserCreate {
  username: string;
  password_hash: string;
  clinic_id: string;
}
