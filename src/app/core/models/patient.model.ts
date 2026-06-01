export interface Patient {
  id: string;
  fullName: string;
  dateOfBirth: string | null;
  medicalAlerts: string | null;
  createdAt: string;
}

export interface CreatePatientRequest {
  fullName: string;
  dateOfBirth?: string | null;
  medicalAlerts?: string | null;
}

export type UpdatePatientRequest = CreatePatientRequest;
