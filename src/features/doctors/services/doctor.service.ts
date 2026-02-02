import { api } from '../../../lib/api';
import type {
  Doctor,
  CreateDoctorDto,
  UpdateDoctorDto,
  // DoctorFiltersType,
  PaginationParams,
  DoctorListResponse,
  DoctorFiltersType,
} from '../types/doctor.types';

export class DoctorService {
  private baseUrl = '/doctors';

  async createDoctor(data: CreateDoctorDto): Promise<Doctor> {
    const response = await api.post<{ status: string; data: Doctor }>(
      this.baseUrl,
      data
    );
    return response.data.data;
  }

  async updateDoctor(id: string, data: UpdateDoctorDto): Promise<Doctor> {
    const response = await api.put<{ status: string; data: Doctor }>(
      `${this.baseUrl}/${id}`,
      data
    );
    return response.data.data;
  }

  async getDoctor(id: string): Promise<Doctor> {
    const response = await api.get<{ status: string; data: Doctor }>(
      `${this.baseUrl}/${id}`
    );
    return response.data.data;
  }

  async getAllDoctors(
    filters: DoctorFiltersType = {},
    pagination: PaginationParams = {}
  ): Promise<DoctorListResponse> {
    const params = {
      ...filters,
      ...pagination,
    };
    const response = await api.get<{ status: string; data: DoctorListResponse }>(
      this.baseUrl,
      { params }
    );
    return response.data.data;
  }

  async deleteDoctor(id: string): Promise<Doctor> {
    const response = await api.delete<{ status: string; data: Doctor }>(
      `${this.baseUrl}/${id}`
    );
    return response.data.data;
  }
}

export const doctorService = new DoctorService();
