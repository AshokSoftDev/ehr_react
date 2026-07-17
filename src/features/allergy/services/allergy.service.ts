import { api } from '@/lib/api';
import type { AllergyItem, CreateAllergyInput, UpdateAllergyInput, AllergyFilters } from '../types/allergy.types';

export const allergyService = {
  async list(filters?: AllergyFilters): Promise<AllergyItem[]> {
    const { data } = await api.get('/master/allergy', { params: filters });
    return data.data;
  },

  async create(payload: CreateAllergyInput): Promise<AllergyItem> {
    const { data } = await api.post('/master/allergy', payload);
    return data.data;
  },

  async update(id: number, payload: UpdateAllergyInput): Promise<AllergyItem> {
    const { data } = await api.put(`/master/allergy/${id}`, payload);
    return data.data;
  },

  async remove(id: number): Promise<void> {
    await api.delete(`/master/allergy/${id}`);
  },
};
