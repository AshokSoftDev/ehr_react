import { api } from "@/lib/api";
import type { PaginatedVitalsResponse, VitalFilters, PatientVital, CreateVitalPayload, UpdateVitalPayload } from '../types/vital.types';

export const vitalService = {
  list: async (filters: VitalFilters): Promise<PaginatedVitalsResponse> => {
    const { patientId, ...params } = filters;
    const response = await api.get(`/patients/${patientId}/vitals`, { params });
    return response.data;
  },

  getById: async (patientId: number, vitalId: number): Promise<PatientVital> => {
    const response = await api.get(`/patients/${patientId}/vitals/${vitalId}`);
    return response.data;
  },

  create: async (patientId: number, data: CreateVitalPayload): Promise<PatientVital> => {
    const response = await api.post(`/patients/${patientId}/vitals`, data);
    return response.data;
  },

  update: async (patientId: number, vitalId: number, data: UpdateVitalPayload): Promise<PatientVital> => {
    const response = await api.put(`/patients/${patientId}/vitals/${vitalId}`, data);
    return response.data;
  },

  delete: async (patientId: number, vitalId: number): Promise<void> => {
    await api.delete(`/patients/${patientId}/vitals/${vitalId}`);
  }
};
