import { api } from '@/lib/api';

export type PatientEmergency = {
  pe_id: number;
  patient_id: number;
  name: string;
  relation: string;
  contactNumber: string;
  status: number;
  createdAt?: string;
  createdBy?: string | null;
  updatedAt?: string;
  updatedBy?: string | null;
  deletedAt?: string | null;
  deletedBy?: string | null;
};

export type CreatePatientEmergencyDto = {
  name: string;
  relation: string;
  contactNumber: string;
  status?: number;
};

export type UpdatePatientEmergencyDto = Partial<CreatePatientEmergencyDto>;

export const patientEmergencyService = {
  async list(patientId: number): Promise<PatientEmergency[]> {
    const res = await api.get<{ status: string; data: PatientEmergency[] }>(`/patients/${patientId}/emergency`);
    return res.data.data;
  },
  async create(patientId: number, data: CreatePatientEmergencyDto): Promise<PatientEmergency> {
    const res = await api.post<{ status: string; data: PatientEmergency }>(`/patients/${patientId}/emergency`, data);
    return res.data.data;
  },
  async update(patientId: number, peId: number, data: UpdatePatientEmergencyDto): Promise<PatientEmergency> {
    const res = await api.put<{ status: string; data: PatientEmergency }>(`/patients/${patientId}/emergency/${peId}`, data);
    return res.data.data;
  },
  async remove(patientId: number, peId: number): Promise<PatientEmergency> {
    const res = await api.delete<{ status: string; data: PatientEmergency }>(`/patients/${patientId}/emergency/${peId}`);
    return res.data.data;
  },
};

