import { api } from '@/lib/api';
import { isAxiosError } from 'axios';

export type PatientInfo = {
  pi_id?: number;
  patient_id?: number;
  bloodGroup: string;
  overseas: boolean;
  passportNumber?: string | null;
  validityDate?: string | Date | null;
  occupation?: string | null;
  department?: string | null;
  companyName?: string | null;
  designation?: string | null;
  employeeCode?: string | null;
  primaryDoctorId?: string | null;
};

export const patientInfoService = {
  async get(patientId: number): Promise<PatientInfo | null> {
    try {
      const res = await api.get<{ status: string; data: PatientInfo }>(`/patients/${patientId}/info`);
      return res.data.data;
    } catch (err: unknown) {
      if (isAxiosError(err) && err.response?.status === 404) return null;
      throw err;
    }
  },

  async create(patientId: number, data: PatientInfo): Promise<PatientInfo> {
    const res = await api.post<{ status: string; data: PatientInfo }>(`/patients/${patientId}/info`, data);
    return res.data.data;
  },

  async update(patientId: number, data: Partial<PatientInfo>): Promise<PatientInfo> {
    const res = await api.put<{ status: string; data: PatientInfo }>(`/patients/${patientId}/info`, data);
    return res.data.data;
  },
};
