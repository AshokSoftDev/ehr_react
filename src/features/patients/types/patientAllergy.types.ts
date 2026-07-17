import type { AllergyItem } from '@/features/allergy/types/allergy.types';

export interface PatientAllergyItem {
  id: number;
  patient_id: number;
  allergy_id?: number | null;
  allergyName: string;
  notes?: string | null;
  status: number;
  createdAt: string;
  updatedAt: string;
  allergy?: AllergyItem;
}

export interface PatientAllergyPayload {
  allergyName: string;
  allergyId?: number;
  status?: number;
}

export type PatientAllergyUpdatePayload = Partial<PatientAllergyPayload>;
