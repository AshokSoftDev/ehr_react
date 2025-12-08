import { api } from '@/lib/api';
import type { Drug } from '../types/drug.types';

class DrugService {
  private baseUrl = '/master/drug';

  async search(search: string): Promise<Drug[]> {
    if (!search || search.length < 2) return [];
    const res = await api.get<{ status: string; data: Drug[] }>(
      this.baseUrl,
      { params: { search, limit: 20 } }
    );
    return res.data.data || [];
  }

  async list(): Promise<Drug[]> {
    const res = await api.get<{ status: string; data: Drug[] }>(this.baseUrl);
    return res.data.data || [];
  }
}

export const drugService = new DrugService();
