import { api } from '@/lib/api';
import type { CreateDrugInput, DrugFilters, DrugItem, UpdateDrugInput } from '../types/drug.types';

export class DrugService {
  private baseUrl = '/master/drug';

  async list(filters: DrugFilters): Promise<DrugItem[]> {
    const res = await api.get<{ status: string; data: DrugItem[] }>(this.baseUrl, { params: filters });
    return res.data.data;
  }

  async create(data: CreateDrugInput): Promise<DrugItem> {
    const res = await api.post<{ status: string; data: DrugItem }>(this.baseUrl, data);
    return res.data.data;
  }

  async update(id: number, data: UpdateDrugInput): Promise<DrugItem> {
    const res = await api.put<{ status: string; data: DrugItem }>(`${this.baseUrl}/${id}`, data);
    return res.data.data;
  }

  async remove(id: number): Promise<DrugItem> {
    const res = await api.delete<{ status: string; data: DrugItem }>(`${this.baseUrl}/${id}`);
    return res.data.data;
  }
}

export const drugService = new DrugService();

