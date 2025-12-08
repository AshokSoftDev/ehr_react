import { api } from '@/lib/api';
import type { VisitDocument, UpdateDocumentPayload } from '../types/visitDocument.types';

class VisitDocumentService {
  private baseUrl = '/visits';

  async list(visitId: number): Promise<VisitDocument[]> {
    const res = await api.get<{ status: string; data: VisitDocument[] }>(
      `${this.baseUrl}/${visitId}/documents`
    );
    return res.data.data;
  }

  async getOne(visitId: number, documentId: number): Promise<VisitDocument> {
    const res = await api.get<{ status: string; data: VisitDocument }>(
      `${this.baseUrl}/${visitId}/documents/${documentId}`
    );
    return res.data.data;
  }

  async upload(visitId: number, file: File, documentTypeId: number, description?: string): Promise<VisitDocument> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type_id', String(documentTypeId));
    if (description) {
      formData.append('description', description);
    }

    const res = await api.post<{ status: string; data: VisitDocument }>(
      `${this.baseUrl}/${visitId}/documents`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return res.data.data;
  }

  async update(visitId: number, documentId: number, payload: UpdateDocumentPayload): Promise<VisitDocument> {
    const res = await api.put<{ status: string; data: VisitDocument }>(
      `${this.baseUrl}/${visitId}/documents/${documentId}`,
      payload
    );
    return res.data.data;
  }

  async remove(visitId: number, documentId: number): Promise<VisitDocument> {
    const res = await api.delete<{ status: string; data: VisitDocument }>(
      `${this.baseUrl}/${visitId}/documents/${documentId}`
    );
    return res.data.data;
  }

  async getFileBlob(visitId: number, documentId: number): Promise<string> {
    const res = await api.get(
      `${this.baseUrl}/${visitId}/documents/${documentId}/file`,
      { responseType: 'blob' }
    );
    const blob = new Blob([res.data], { type: res.headers['content-type'] });
    return URL.createObjectURL(blob);
  }

  getFileUrl(visitId: number, documentId: number): string {
    return `${api.defaults.baseURL}${this.baseUrl}/${visitId}/documents/${documentId}/file`;
  }
}

export const visitDocumentService = new VisitDocumentService();
