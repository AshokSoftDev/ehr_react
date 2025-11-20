export interface LocationItem {
  location_id: number;
  location_name: string;
  address?: string | null;
  city: string;
  state: string;
  status: number;
  createdAt: string;
  createdBy?: string | null;
  updatedAt: string;
  updatedBy?: string | null;
  deletedAt?: string | null;
  deletedBy?: string | null;
}

export interface CreateLocationInput {
  location_name: string;
  address?: string;
  city: string;
  state: string;
}

export type UpdateLocationInput = Partial<CreateLocationInput> & {
  status?: number;
};

export interface LocationFilters {
  search?: string;
}

