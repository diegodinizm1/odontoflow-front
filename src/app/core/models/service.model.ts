export interface ClinicService {
  id: string;
  name: string;
  durationMinutes: number;
  price: number;
  active: boolean;
}

export interface CreateServiceRequest {
  name: string;
  durationMinutes: number;
  price: number;
}
