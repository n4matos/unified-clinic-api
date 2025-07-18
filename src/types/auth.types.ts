export interface JWTPayload {
  sub: string; // client_id
  iat: number;
  exp: number;
  type: 'access' | 'refresh';
}

export interface RefreshToken {
  id: string;
  client_id: string;
  tenant_id: string;
  token_hash: string;
  expires_at: Date;
  created_at: Date;
  revoked: boolean;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: 'Bearer';
  expires_in: number; // em segundos
}

export interface RefreshTokenResponse {
  access_token: string;
  token_type: 'Bearer';
  expires_in: number; // em segundos
}

export interface Client {
  id: string;
  client_id: string;
  client_secret: string;
  name: string;
  allowed_tenants: string[];
  created_at: Date;
  active: boolean;
}

export interface ClientCreateRequest {
  client_id: string;
  client_secret: string;
  name: string;
  allowed_tenants: string[];
}