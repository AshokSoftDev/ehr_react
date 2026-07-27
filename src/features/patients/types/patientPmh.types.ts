import type { PmhItem } from '@/features/pmh/types/pmh.types';

export interface PatientPmhItem {
  id: number;
  patient_id: number;
  pmh_id: number;
  month: number | null;
  year: number | null;
  comments: string | null;
  status: number;
  pmh?: PmhItem;
}

export interface SyncPatientPmhPayload {
  id?: number;
  pmhId: number;
  month?: number | null;
  year?: number | null;
  comments?: string | null;
}
