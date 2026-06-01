export interface RegisterTenantRequest {
  clinicName: string;
  document: string;
  fullName: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
}

export interface TokenPayload {
  sub: string;
  tenant_id: string;
  role: string;
  email: string;
  iat: number;
  exp: number;
}
