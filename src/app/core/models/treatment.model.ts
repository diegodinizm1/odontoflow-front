export type TreatmentPlanStatus = 'PROPOSED' | 'ACCEPTED' | 'COMPLETED' | 'CANCELED';
export type TreatmentItemStatus = 'PENDING' | 'DONE';

export interface TreatmentItem {
  id: string;
  description: string;
  tooth: string | null;
  amount: number;
  status: TreatmentItemStatus;
  chargeId: string | null;
}

export interface TreatmentPlan {
  id: string;
  title: string;
  status: TreatmentPlanStatus;
  total: number;
  createdByName: string;
  createdAt: string;
  items: TreatmentItem[];
}

export interface CreateTreatmentItemRequest {
  description: string;
  tooth?: string | null;
  amount: number;
}

export interface CreateTreatmentPlanRequest {
  title: string;
  items: CreateTreatmentItemRequest[];
}
