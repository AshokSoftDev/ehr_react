// Document type returned from API
export interface VisitDocument {
  document_id: number;
  visit_id: number | null;
  patient_id: number;
  document_type_id: number;
  file_name: string;
  file_path: string;
  description: string | null;
  mime_type: string;
  file_size: number;
  status: number;
  createdAt: string;
  createdBy: string | null;
  updatedAt: string;
  documentType?: {
    document_type_id: number;
    type_name: string;
  };
  visit?: {
    visit_id: number;
    visit_type: string;
    visit_date: string;
    doctor?: { displayName: string };
  };
}

// Payload for creating a document
export interface CreateDocumentPayload {
  document_type_id: number;
  description?: string;
  file: File;
}

// Payload for updating a document
export interface UpdateDocumentPayload {
  file_name?: string;
  document_type_id?: number;
  description?: string;
}
