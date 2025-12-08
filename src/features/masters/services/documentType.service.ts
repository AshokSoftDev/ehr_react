import { api } from '@/lib/api';
import type { DocumentType, CreateDocumentTypePayload, UpdateDocumentTypePayload } from '../types/documentType.types';

class DocumentTypeService {
  private baseUrl = '/master/document-type';

  async list(search?: string): Promise<DocumentType[]> {
    const params = search ? { search } : {};
    const res = await api.get<{ status: string; data: DocumentType[] }>(this.baseUrl, { params });
    return res.data.data;
  }

  async getOne(id: number): Promise<DocumentType> {
    const res = await api.get<{ status: string; data: DocumentType }>(`${this.baseUrl}/${id}`);
    return res.data.data;
  }

  async create(payload: CreateDocumentTypePayload): Promise<DocumentType> {
    const res = await api.post<{ status: string; data: DocumentType }>(this.baseUrl, payload);
    return res.data.data;
  }

  async update(id: number, payload: UpdateDocumentTypePayload): Promise<DocumentType> {
    const res = await api.put<{ status: string; data: DocumentType }>(`${this.baseUrl}/${id}`, payload);
    return res.data.data;
  }

  async remove(id: number): Promise<void> {
    await api.delete(`${this.baseUrl}/${id}`);
  }
}

export const documentTypeService = new DocumentTypeService();
