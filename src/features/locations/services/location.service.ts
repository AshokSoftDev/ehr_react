import { api } from '@/lib/api';
import type {
  CreateLocationInput,
  LocationFilters,
  LocationItem,
  UpdateLocationInput,
} from '../types/location.types';

export class LocationService {
  private baseUrl = '/master/location';

  async list(filters: LocationFilters): Promise<LocationItem[]> {
    const res = await api.get<{ status: string; data: LocationItem[] }>(this.baseUrl, {
      params: filters,
    });
    return res.data.data;
  }

  async create(data: CreateLocationInput): Promise<LocationItem> {
    const res = await api.post<{ status: string; data: LocationItem }>(this.baseUrl, data);
    return res.data.data;
  }

  async update(id: number, data: UpdateLocationInput): Promise<LocationItem> {
    const res = await api.put<{ status: string; data: LocationItem }>(
      `${this.baseUrl}/${id}`,
      data,
    );
    return res.data.data;
  }

  async remove(id: number): Promise<LocationItem> {
    const res = await api.delete<{ status: string; data: LocationItem }>(
      `${this.baseUrl}/${id}`,
    );
    return res.data.data;
  }
}

export const locationService = new LocationService();
