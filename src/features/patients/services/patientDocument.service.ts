import { api } from '@/lib/api';
import type { VisitDocument, UpdateDocumentPayload } from '@/features/visits/types/visitDocument.types';

class PatientDocumentService {
  async list(patientId: number): Promise<VisitDocument[]> {
    const response = await api.get(`/patients/${patientId}/documents`);
    return response.data.data;
  }

  async upload(patientId: number, file: File, documentTypeId: number, description?: string): Promise<VisitDocument> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type_id', String(documentTypeId));
    if (description) {
      formData.append('description', description);
    }

    const response = await api.post(`/patients/${patientId}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  }

  async update(patientId: number, documentId: number, payload: UpdateDocumentPayload): Promise<VisitDocument> {
    const response = await api.put(`/patients/${patientId}/documents/${documentId}`, payload);
    return response.data.data;
  }

  async remove(patientId: number, documentId: number): Promise<void> {
    await api.delete(`/patients/${patientId}/documents/${documentId}`);
  }

  getFileUrl(patientId: number, documentId: number): string {
    return `${api.defaults.baseURL}/patients/${patientId}/documents/${documentId}/file`;
  }

  async getFileBlob(patientId: number, documentId: number): Promise<string> {
    const response = await api.get(`/patients/${patientId}/documents/${documentId}/file`, {
      responseType: 'blob',
    });
    return URL.createObjectURL(response.data);
  }
}

export const patientDocumentService = new PatientDocumentService();
