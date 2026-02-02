export interface DrugItem {
  drug_id: number;
  drug_generic: string;
  drug_name: string;
  drug_type: string;
  drug_dosage: string;
  drug_measure: string;
  amount: number;
  instruction?: string | null;
  status: number;
  createdAt: string;
  createdBy?: string | null;
  updatedAt: string;
  updatedBy?: string | null;
  deletedAt?: string | null;
  deletedBy?: string | null;
}

export interface CreateDrugInput {
  drug_generic: string;
  drug_name: string;
  drug_type: string;
  drug_dosage: string;
  drug_measure: string;
  amount: number;
  instruction?: string;
  status?: number;
}

export type UpdateDrugInput = Partial<CreateDrugInput>;

export interface DrugFilters {
  search?: string;
}

