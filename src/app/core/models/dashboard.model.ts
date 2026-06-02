import { Appointment } from './appointment.model';

export interface DashboardSummary {
  patientsCount: number;
  appointmentsToday: number;
  paidThisMonth: number;
  pendingTotal: number;
  todayAppointments: Appointment[];
}
