export interface FamilyDiseaseItem {
  family_disease_id: number;
  diseaseName: string;
  notes: string | null;
  status: number;
  createdAt: string;
}

export interface FamilyDiseasePayload {
  diseaseName: string;
  notes?: string;
  status?: number;
}

export type FamilyDiseaseUpdatePayload = Partial<FamilyDiseasePayload>;
