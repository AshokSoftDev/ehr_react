import { api } from '@/lib/api';
import type { SurgeryItem, SurgeryPayload, SurgeryUpdatePayload } from '../types/surgery.types';

export const surgeryService = {
  async list(): Promise<SurgeryItem[]> {
    const { data } = await api.get('/master/surgery');
    return data.data;
  },

  async create(payload: SurgeryPayload): Promise<SurgeryItem> {
    const { data } = await api.post('/master/surgery', payload);
    return data.data;
  },

  async update(surgeryId: number, payload: SurgeryUpdatePayload): Promise<SurgeryItem> {
    const { data } = await api.put(`/master/surgery/${surgeryId}`, payload);
    return data.data;
  },

  async remove(surgeryId: number): Promise<void> {
    await api.delete(`/master/surgery/${surgeryId}`);
  },
};
