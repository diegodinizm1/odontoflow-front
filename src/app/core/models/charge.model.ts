export type ChargeStatus = 'PENDING' | 'PAID' | 'CANCELED';

export interface Charge {
  id: string;
  patientId: string;
  patientName: string;
  appointmentId: string | null;
  description: string;
  amount: number;
  status: ChargeStatus;
  dueDate: string | null;
  paidAt: string | null;
  createdAt: string;
}

export interface CreateChargeRequest {
  patientId: string;
  description: string;
  amount: number;
  appointmentId?: string | null;
  dueDate?: string | null;
}

export interface FinancialSummary {
  year: number;
  month: number;
  paidThisMonth: number;
  pendingTotal: number;
}
