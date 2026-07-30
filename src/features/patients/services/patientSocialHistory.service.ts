import { api } from '@/lib/api';
import type { PatientSocialHistoryItem, SyncPatientSocialHistoryPayload } from '../types/patientSocialHistory.types';

export const patientSocialHistoryService = {
  async getByPatientId(patientId: number): Promise<PatientSocialHistoryItem[]> {
    const { data } = await api.get(`/patients/${patientId}/social-history`);
    return data.data || [];
  },

  async sync(patientId: number, payloads: SyncPatientSocialHistoryPayload[]): Promise<void> {
    await api.put(`/patients/${patientId}/social-history/sync`, payloads);
  },
};
