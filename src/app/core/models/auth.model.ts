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

export type Role = 'DENTIST' | 'RECEPTIONIST';

export interface TokenPayload {
  sub: string;
  tenant_id: string;
  role: Role;
  name: string;
  email: string;
  iat: number;
  exp: number;
}

export const ROLE_LABELS: Record<Role, string> = {
  DENTIST: 'Dentista',
  RECEPTIONIST: 'Recepcionista',
};
