import type { SocialItem } from '@/features/social/types/social.types';

export interface PatientSocialHistoryItem {
  id: number;
  patient_id: number;
  social_master_id: number;
  selectedOption: number | null;
  comments: string | null;
  status: number;
  createdAt: string;
  updatedAt?: string;
  socialMaster?: SocialItem;
}

export interface SyncPatientSocialHistoryPayload {
  id?: number;
  socialMasterId: number;
  selectedOption?: number | null;
  comments?: string | null;
  status?: number;
}
