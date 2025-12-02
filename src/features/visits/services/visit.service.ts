import { api } from '@/lib/api';
import type { VisitFilters, PaginatedVisits } from '../types/visit.types';

export class VisitService {
  private baseUrl = '/visits';

  async list(filters: VisitFilters): Promise<PaginatedVisits> {
    const res = await api.get<{ status: string; data: PaginatedVisits }>(this.baseUrl, { params: filters });
    return res.data.data;
  }
}

export const visitService = new VisitService();
