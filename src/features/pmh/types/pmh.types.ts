export interface PmhItem {
  pmh_id: number;
  conditionName: string;
  notes: string | null;
  status: number;
  createdAt: string;
}

export interface PmhPayload {
  conditionName: string;
  notes?: string;
  status?: number;
}

export type PmhUpdatePayload = Partial<PmhPayload>;
