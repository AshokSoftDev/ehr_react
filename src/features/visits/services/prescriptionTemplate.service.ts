import { api } from '@/lib/api';
import type {
  PrescriptionTemplate,
  CreatePrescriptionTemplatePayload,
} from '../types/prescription.types';

export interface BulkCreateTemplatePayload {
  templates: CreatePrescriptionTemplatePayload[];
}

class PrescriptionTemplateService {
  private baseUrl = '/visits/prescription-templates';

  async list(templateId?: number, search?: string): Promise<PrescriptionTemplate[]> {
    const res = await api.get<{ status: string; data: PrescriptionTemplate[] }>(
      this.baseUrl,
      { params: { 
        ...(templateId && { template_id: templateId }),
        ...(search && { search }),
      } }
    );
    return res.data.data;
  }

  async getOne(tempId: number): Promise<PrescriptionTemplate> {
    const res = await api.get<{ status: string; data: PrescriptionTemplate }>(
      `${this.baseUrl}/${tempId}`
    );
    return res.data.data;
  }

  async create(payload: CreatePrescriptionTemplatePayload): Promise<PrescriptionTemplate> {
    const res = await api.post<{ status: string; data: PrescriptionTemplate }>(
      this.baseUrl,
      payload
    );
    return res.data.data;
  }

  async bulkCreate(payload: BulkCreateTemplatePayload): Promise<{ count: number }> {
    const res = await api.post<{ status: string; data: { count: number } }>(
      `${this.baseUrl}/bulk`,
      payload
    );
    return res.data.data;
  }

  async remove(tempId: number): Promise<PrescriptionTemplate> {
    const res = await api.delete<{ status: string; data: PrescriptionTemplate }>(
      `${this.baseUrl}/${tempId}`
    );
    return res.data.data;
  }
}

export const prescriptionTemplateService = new PrescriptionTemplateService();
