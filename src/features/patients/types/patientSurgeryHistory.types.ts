import type { SurgeryItem } from '@/features/surgery/types/surgery.types';

export interface PatientSurgeryHistoryItem {
  id: number;
  patient_id: number;
  surgery_id: number;
  month: number | null;
  year: number | null;
  comments: string | null;
  status: number;
  surgery?: SurgeryItem;
}

export interface SyncPatientSurgeryHistoryPayload {
  id?: number;
  surgeryId: number;
  month?: number | null;
  year?: number | null;
  comments?: string | null;
}
