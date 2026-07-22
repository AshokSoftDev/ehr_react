import { api } from '@/lib/api';
import type { PatientAllergyItem, PatientAllergyPayload, PatientAllergyUpdatePayload } from '../types/patientAllergy.types';

export const patientAllergyService = {
  async list(patientId: number): Promise<PatientAllergyItem[]> {
    const { data } = await api.get(`/patients/${patientId}/allergies`);
    return data.data;
  },

  async create(patientId: number, payload: PatientAllergyPayload | PatientAllergyPayload[]): Promise<PatientAllergyItem | { count: number }> {
    const { data } = await api.post(`/patients/${patientId}/allergies`, payload);
    return data.data;
  },

  async update(patientId: number, paId: number, payload: PatientAllergyUpdatePayload): Promise<PatientAllergyItem> {
    const { data } = await api.put(`/patients/${patientId}/allergies/${paId}`, payload);
    return data.data;
  },

  async remove(patientId: number, paId: number): Promise<void> {
    await api.delete(`/patients/${patientId}/allergies/${paId}`);
  },

  async sync(patientId: number, payloads: import('../types/patientAllergy.types').SyncPatientAllergyPayload[]): Promise<{ success: boolean }> {
    const { data } = await api.put(`/patients/${patientId}/allergies/sync`, payloads);
    return data;
  },
};
