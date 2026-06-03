export interface PublicDentist {
  id: string;
  fullName: string;
}

export interface PublicClinic {
  clinicName: string;
  publicSlug: string;
  dentists: PublicDentist[];
}

export interface Availability {
  dentistId: string;
  date: string;   // 'YYYY-MM-DD'
  slots: string[]; // ['08:00', '08:30', ...]
}

export interface CreateBookingRequest {
  dentistId: string;
  date: string;        // 'YYYY-MM-DD'
  time: string;        // 'HH:mm'
  patientName: string;
  patientPhone: string;
}

export interface BookingConfirmation {
  appointmentId: string;
  dentistName: string;
  startTime: string;
  endTime: string;
  status: 'PENDING';
}
