export interface AllergyItem {
  allergy_id: number;
  allergyName: string;
  allergyType: string;
  status: number;
  createdAt: string;
  createdBy?: string | null;
  updatedAt: string;
  updatedBy?: string | null;
  deletedAt?: string | null;
  deletedBy?: string | null;
}

export interface CreateAllergyInput {
  allergyName: string;
  allergyType: string;
}

export type UpdateAllergyInput = Partial<CreateAllergyInput> & {
  status?: number;
};

export interface AllergyFilters {
  search?: string;
}
