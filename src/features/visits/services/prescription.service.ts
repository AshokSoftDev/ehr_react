import { api } from '@/lib/api';
import type {
  Prescription,
  CreatePrescriptionPayload,
  UpdatePrescriptionPayload,
  BulkCreatePrescriptionPayload,
  BulkUpdatePrescriptionPayload,
  BulkDeletePrescriptionPayload,
} from '../types/prescription.types';

class PrescriptionService {
  private baseUrl = '/visits';

  async list(visitId: number): Promise<Prescription[]> {
    const res = await api.get<{ status: string; data: Prescription[] }>(
      `${this.baseUrl}/${visitId}/prescriptions`
    );
    return res.data.data;
  }

  async getOne(visitId: number, prescriptionId: number): Promise<Prescription> {
    const res = await api.get<{ status: string; data: Prescription }>(
      `${this.baseUrl}/${visitId}/prescriptions/${prescriptionId}`
    );
    return res.data.data;
  }

  async create(visitId: number, payload: CreatePrescriptionPayload): Promise<Prescription> {
    const res = await api.post<{ status: string; data: Prescription }>(
      `${this.baseUrl}/${visitId}/prescriptions`,
      payload
    );
    return res.data.data;
  }

  // Bulk create multiple prescriptions
  async bulkCreate(visitId: number, payload: BulkCreatePrescriptionPayload): Promise<Prescription[]> {
    const res = await api.post<{ status: string; data: Prescription[] }>(
      `${this.baseUrl}/${visitId}/prescriptions/bulk`,
      payload
    );
    return res.data.data;
  }

  // Bulk update multiple prescriptions
  async bulkUpdate(visitId: number, payload: BulkUpdatePrescriptionPayload): Promise<Prescription[]> {
    const res = await api.put<{ status: string; data: Prescription[] }>(
      `${this.baseUrl}/${visitId}/prescriptions/bulk`,
      payload
    );
    return res.data.data;
  }

  // Bulk delete multiple prescriptions
  async bulkDelete(visitId: number, payload: BulkDeletePrescriptionPayload): Promise<Prescription[]> {
    const res = await api.delete<{ status: string; data: Prescription[] }>(
      `${this.baseUrl}/${visitId}/prescriptions/bulk`,
      { data: payload }
    );
    return res.data.data;
  }

  async update(
    visitId: number,
    prescriptionId: number,
    payload: UpdatePrescriptionPayload
  ): Promise<Prescription> {
    const res = await api.put<{ status: string; data: Prescription }>(
      `${this.baseUrl}/${visitId}/prescriptions/${prescriptionId}`,
      payload
    );
    return res.data.data;
  }

  async remove(visitId: number, prescriptionId: number): Promise<Prescription> {
    const res = await api.delete<{ status: string; data: Prescription }>(
      `${this.baseUrl}/${visitId}/prescriptions/${prescriptionId}`
    );
    return res.data.data;
  }
}

export const prescriptionService = new PrescriptionService();
