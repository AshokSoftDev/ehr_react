export interface DocumentType {
  document_type_id: number;
  type_name: string;
  description: string | null;
  status: number;
  createdAt: string;
  createdBy: string | null;
  updatedAt: string;
}

export interface CreateDocumentTypePayload {
  type_name: string;
  description?: string;
}

export interface UpdateDocumentTypePayload {
  type_name?: string;
  description?: string;
  status?: number;
}
