import { api } from '@/lib/api';
import type { PatientFamilyHistoryItem, SyncPatientFamilyHistoryPayload } from '../types/patientFamilyHistory.types';

export const patientFamilyHistoryService = {
  async getByPatientId(patientId: number): Promise<PatientFamilyHistoryItem[]> {
    const { data } = await api.get(`/patients/${patientId}/family-history`);
    return data.data;
  },

  async sync(patientId: number, payloads: SyncPatientFamilyHistoryPayload[]): Promise<void> {
    await api.put(`/patients/${patientId}/family-history/sync`, payloads);
  },
};
