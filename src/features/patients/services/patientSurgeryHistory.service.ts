import { api } from '@/lib/api';
import type { PatientSurgeryHistoryItem, SyncPatientSurgeryHistoryPayload } from '../types/patientSurgeryHistory.types';

export const patientSurgeryHistoryService = {
  async getByPatientId(patientId: number): Promise<PatientSurgeryHistoryItem[]> {
    const { data } = await api.get(`/patients/${patientId}/surgery-history`);
    return data.data;
  },

  async sync(patientId: number, payloads: SyncPatientSurgeryHistoryPayload[]): Promise<void> {
    await api.put(`/patients/${patientId}/surgery-history/sync`, payloads);
  },
};
