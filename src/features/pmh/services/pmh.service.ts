import { api } from '@/lib/api';
import type { PmhItem, PmhPayload, PmhUpdatePayload } from '../types/pmh.types';

export const pmhService = {
  async list(): Promise<PmhItem[]> {
    const { data } = await api.get('/master/pmh');
    return data.data;
  },

  async create(payload: PmhPayload): Promise<PmhItem> {
    const { data } = await api.post('/master/pmh', payload);
    return data.data;
  },

  async update(pmhId: number, payload: PmhUpdatePayload): Promise<PmhItem> {
    const { data } = await api.put(`/master/pmh/${pmhId}`, payload);
    return data.data;
  },

  async remove(pmhId: number): Promise<void> {
    await api.delete(`/master/pmh/${pmhId}`);
  },
};
