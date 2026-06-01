export type SubscriptionStatus = 'TRIALING' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED';
export type InvoiceStatus = 'OPEN' | 'PAID' | 'FAILED';

export interface PlanInfo {
  code: string;
  name: string;
  monthlyPrice: number;
  maxPatients: number;
  maxDentists: number;
}

export interface Subscription {
  plan: string;
  planName: string;
  monthlyPrice: number;
  status: SubscriptionStatus;
  currentPeriodEnd: string | null;
  maxPatients: number;
  maxDentists: number;
}

export interface Invoice {
  id: string;
  description: string;
  amount: number;
  status: InvoiceStatus;
  paidAt: string | null;
  createdAt: string;
}
