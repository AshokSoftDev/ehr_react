import { api } from '@/lib/api';
import type { DentalHPI, CreateDentalHPIPayload, UpdateDentalHPIPayload } from '../types/dentalHpi.types';

interface ApiResponse<T> {
  status: string;
  data: T;
  message?: string;
}

export const dentalHpiService = {
  list: async (visitId: number): Promise<DentalHPI[]> => {
    const res = await api.get<ApiResponse<DentalHPI[]>>(`/visits/${visitId}/dental-hpi`);
    return res.data.data;
  },

  getOne: async (visitId: number, hpiId: number): Promise<DentalHPI> => {
    const res = await api.get<ApiResponse<DentalHPI>>(`/visits/${visitId}/dental-hpi/${hpiId}`);
    return res.data.data;
  },

  create: async (visitId: number, payload: CreateDentalHPIPayload): Promise<DentalHPI> => {
    const res = await api.post<ApiResponse<DentalHPI>>(`/visits/${visitId}/dental-hpi`, payload);
    return res.data.data;
  },

  update: async (visitId: number, hpiId: number, payload: UpdateDentalHPIPayload): Promise<DentalHPI> => {
    const res = await api.put<ApiResponse<DentalHPI>>(`/visits/${visitId}/dental-hpi/${hpiId}`, payload);
    return res.data.data;
  },

  remove: async (visitId: number, hpiId: number): Promise<DentalHPI> => {
    const res = await api.delete<ApiResponse<DentalHPI>>(`/visits/${visitId}/dental-hpi/${hpiId}`);
    return res.data.data;
  },
};
