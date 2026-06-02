export type AppointmentStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELED';

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  dentistId: string;
  startTime: string; // 'YYYY-MM-DDTHH:mm:ss' (local, no timezone)
  endTime: string;
  status: AppointmentStatus;
}

export interface CreateAppointmentRequest {
  patientId: string;
  dentistId?: string | null;
  startTime: string;
  endTime: string;
}

export interface RescheduleAppointmentRequest {
  startTime: string;
  endTime: string;
}
