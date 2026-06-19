import { api } from '@/lib/api';
import type { VisitFilters, PaginatedVisits } from '../types/visit.types';

export interface StatusCounts {
  scheduled: number;
  pending: number;
  notesGenerated: number;
  postedToEHR: number;
  total: number;
}

export class VisitService {
  private baseUrl = '/visits';

  async list(filters: VisitFilters): Promise<PaginatedVisits> {
    const res = await api.get<{ status: string; data: PaginatedVisits }>(this.baseUrl, { params: filters });
    return res.data.data;
  }

  async getStatusCounts(filters: { date?: string; doctorId?: string }): Promise<StatusCounts> {
    const res = await api.get<{ status: string; data: StatusCounts }>(`${this.baseUrl}/status-counts`, { params: filters });
    return res.data.data;
  }

  async create(payload: import('../types/visit.types').CreateVisitPayload): Promise<import('../types/visit.types').VisitItem> {
    const res = await api.post<{ status: string; data: import('../types/visit.types').VisitItem }>(this.baseUrl, payload);
    return res.data.data;
  }
}

export const visitService = new VisitService();
