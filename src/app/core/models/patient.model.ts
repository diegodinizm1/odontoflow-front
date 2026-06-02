export interface Patient {
  id: string;
  fullName: string;
  phone: string | null;
  dateOfBirth: string | null;
  medicalAlerts: string | null;
  createdAt: string;
}

export interface CreatePatientRequest {
  fullName: string;
  phone?: string | null;
  dateOfBirth?: string | null;
  medicalAlerts?: string | null;
}

export type UpdatePatientRequest = CreatePatientRequest;
