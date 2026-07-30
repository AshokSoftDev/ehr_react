import { api } from '@/lib/api';
import type { FamilyDiseaseItem, FamilyDiseasePayload, FamilyDiseaseUpdatePayload } from '../types/familyDisease.types';

export const familyDiseaseService = {
  async list(): Promise<FamilyDiseaseItem[]> {
    const { data } = await api.get('/master/family-disease');
    return data.data;
  },

  async create(payload: FamilyDiseasePayload): Promise<FamilyDiseaseItem> {
    const { data } = await api.post('/master/family-disease', payload);
    return data.data;
  },

  async update(id: number, payload: FamilyDiseaseUpdatePayload): Promise<FamilyDiseaseItem> {
    const { data } = await api.put(`/master/family-disease/${id}`, payload);
    return data.data;
  },

  async remove(id: number): Promise<void> {
    await api.delete(`/master/family-disease/${id}`);
  },
};
