import { api } from '@/lib/api';
import type { AppointmentFilters, AppointmentItem, AppointmentDoctorLite, AppointmentPatientLite, CreateAppointmentInput, UpdateAppointmentInput, PaginatedAppointments } from '../types/appointment.types';

export class AppointmentService {
  private baseUrl = '/appointments';

  async searchMrn(search: string): Promise<AppointmentPatientLite[]> {
    const res = await api.get<{ status: string; data: AppointmentPatientLite[] }>(`${this.baseUrl}/search/mrn`, { params: { search } });
    return res.data.data;
  }

  async getDoctors(): Promise<AppointmentDoctorLite[]> {
    const res = await api.get<{ status: string; data: AppointmentDoctorLite[] }>(`${this.baseUrl}/doctors`);
    return res.data.data;
  }

  async list(filters: AppointmentFilters): Promise<PaginatedAppointments> {
    const res = await api.get<{ status: string; data: PaginatedAppointments }>(this.baseUrl, { params: filters });
    return res.data.data;
  }

  async getDashboardStats(filters: AppointmentFilters): Promise<Record<string, number>> {
    const res = await api.get<{ status: string; data: Record<string, number> }>(`${this.baseUrl}/stats`, { params: filters });
    return res.data.data;
  }

  async create(data: CreateAppointmentInput): Promise<AppointmentItem> {
    const res = await api.post<{ status: string; data: AppointmentItem }>(this.baseUrl, data);
    return res.data.data;
  }

  async update(id: number, data: UpdateAppointmentInput): Promise<AppointmentItem> {
    const res = await api.put<{ status: string; data: AppointmentItem }>(`${this.baseUrl}/${id}`, data);
    return res.data.data;
  }

  async remove(id: number): Promise<AppointmentItem> {
    const res = await api.delete<{ status: string; data: AppointmentItem }>(`${this.baseUrl}/${id}`);
    return res.data.data;
  }

  async listCompleted(params: { patient_id?: number; dateFrom?: string; dateTo?: string; page?: number; limit?: number }) {
    const res = await api.get<{ status: string; data: PaginatedAppointments }>(`${this.baseUrl}/completed`, {
      params,
    });
    return res.data.data;
  }
}

export const appointmentService = new AppointmentService();
