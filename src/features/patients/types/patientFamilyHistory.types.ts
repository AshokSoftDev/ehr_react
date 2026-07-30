import type { FamilyDiseaseItem } from '@/features/family-disease/types/familyDisease.types';

export interface PatientFamilyHistoryItem {
  id: number;
  patient_id: number;
  family_disease_id: number;
  mother: boolean;
  father: boolean;
  sisters: boolean;
  brothers: boolean;
  maternalMother: boolean;
  maternalFather: boolean;
  paternalMother: boolean;
  paternalFather: boolean;
  otherRelatives: string | null;
  comments: string | null;
  status: number;
  createdAt: string;
  updatedAt?: string;
  familyDisease?: FamilyDiseaseItem;
}

export interface SyncPatientFamilyHistoryPayload {
  id?: number;
  familyDiseaseId: number;
  mother?: boolean;
  father?: boolean;
  sisters?: boolean;
  brothers?: boolean;
  maternalMother?: boolean;
  maternalFather?: boolean;
  paternalMother?: boolean;
  paternalFather?: boolean;
  otherRelatives?: string | null;
  comments?: string | null;
  status?: number;
}
