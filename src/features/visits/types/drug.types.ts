export interface Drug {
  drug_id: number;
  drug_name: string;
  drug_generic: string;
  drug_type: string;
  drug_dosage: string;
  drug_measure: string;
  amount: number;
  instruction?: string | null;
  status: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface DrugFilters {
  search?: string;
  page?: number;
  limit?: number;
}

