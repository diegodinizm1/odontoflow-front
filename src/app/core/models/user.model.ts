export type Role = 'DENTIST' | 'RECEPTIONIST';

export interface TeamMember {
  id: string;
  fullName: string;
  email: string;
  role: Role;
}

export interface InviteUserRequest {
  fullName: string;
  email: string;
  role: Role;
  password: string;
}
