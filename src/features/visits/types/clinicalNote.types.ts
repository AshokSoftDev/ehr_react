export type ClinicalNoteType = 'text' | 'audio';

export interface ClinicalNote {
  cn_id: number;
  patient_id: number;
  appointment_id?: number | null;
  visit_id: number;
  location_id?: number | null;
  doctor_id: string;
  notes_type: ClinicalNoteType;
  editor_notes?: string | null;
  transcription?: string | null;
  audio_url?: string | null;
  retry_count: number;
  status: number;
  createdAt?: string;
  createdBy?: string | null;
  updatedAt?: string;
  updatedBy?: string | null;
  deletedAt?: string | null;
  deletedBy?: string | null;
}

export interface CreateClinicalNotePayload {
  notes_type: ClinicalNoteType;
  editor_notes?: string;
  file?: File;
}

export interface UpdateClinicalNotePayload {
  editor_notes: string;
}
