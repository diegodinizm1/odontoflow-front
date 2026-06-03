import { DentalSpecialty } from '../utils/specialty.util';

export interface ClinicService {
  id: string;
  name: string;
  category: DentalSpecialty;
  durationMinutes: number;
  price: number;
  dentistIds: string[];
  active: boolean;
}

export interface CreateServiceRequest {
  name: string;
  category: DentalSpecialty;
  durationMinutes: number;
  price: number;
  dentistIds: string[];
}
