export interface SurgeryItem {
  surgery_id: number;
  surgeryName: string;
  notes: string | null;
  status: number;
  createdAt: string;
}

export interface SurgeryPayload {
  surgeryName: string;
  notes?: string;
  status?: number;
}

export type SurgeryUpdatePayload = Partial<SurgeryPayload>;
