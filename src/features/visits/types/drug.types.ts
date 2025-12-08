export interface Drug {
  drug_id: number;
  drug_name: string;
  drug_generic: string;
  drug_type: string;
  drug_dosage: string;
  drug_measure: string;
  instruction?: string;
  status: number;
}

export interface DrugFilters {
  search?: string;
  page?: number;
  limit?: number;
}
