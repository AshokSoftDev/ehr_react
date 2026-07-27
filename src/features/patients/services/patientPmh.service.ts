import { api } from '@/lib/api';
import type { PatientPmhItem, SyncPatientPmhPayload } from '../types/patientPmh.types';

export const patientPmhService = {
  async getByPatientId(patientId: number): Promise<PatientPmhItem[]> {
    const { data } = await api.get(`/patients/${patientId}/pmh`);
    return data.data;
  },

  async sync(patientId: number, payloads: SyncPatientPmhPayload[]): Promise<void> {
    await api.put(`/patients/${patientId}/pmh/sync`, payloads);
  },
};
