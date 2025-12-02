export interface LocationItem {
  location_id: number;
  location_name: string;
  address?: string | null;
  city: string;
  state: string;
  status: number;
  active: boolean;
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
  active?: boolean;
  status?: number;
}

export type UpdateLocationInput = Partial<CreateLocationInput> & {
  location_id?: number;
  status?: number;
  active?: boolean;
};

export interface LocationFilters {
  search?: string;
}
