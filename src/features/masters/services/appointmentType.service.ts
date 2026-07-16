import { api } from '@/lib/api';
import type { AppointmentType, CreateAppointmentTypePayload, UpdateAppointmentTypePayload } from '../types/appointmentType.types';

class AppointmentTypeService {
  private baseUrl = '/master/appointment-type';

  async list(search?: string, status?: number): Promise<AppointmentType[]> {
    const params: any = {};
    if (search) params.search = search;
    if (status !== undefined) params.status = status;
    
    const res = await api.get<{ status: string; data: AppointmentType[] }>(this.baseUrl, { params });
    return res.data.data;
  }

  async getOne(id: number): Promise<AppointmentType> {
    const res = await api.get<{ status: string; data: AppointmentType }>(`${this.baseUrl}/${id}`);
    return res.data.data;
  }

  async create(payload: CreateAppointmentTypePayload): Promise<AppointmentType> {
    const res = await api.post<{ status: string; data: AppointmentType }>(this.baseUrl, payload);
    return res.data.data;
  }

  async update(id: number, payload: UpdateAppointmentTypePayload): Promise<AppointmentType> {
    const res = await api.put<{ status: string; data: AppointmentType }>(`${this.baseUrl}/${id}`, payload);
    return res.data.data;
  }

  async remove(id: number): Promise<void> {
    await api.delete(`${this.baseUrl}/${id}`);
  }
}

export const appointmentTypeService = new AppointmentTypeService();
