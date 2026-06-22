import { api } from '@/lib/api';
import type {
  ClinicalNote,
  CreateClinicalNotePayload,
  UpdateClinicalNotePayload,
} from '../types/clinicalNote.types';

class ClinicalNotesService {
  private baseUrl = '/visits';

  async list(visitId: number): Promise<ClinicalNote[]> {
    const res = await api.get<{ status: string; data: ClinicalNote[] }>(
      `${this.baseUrl}/${visitId}/clinical-notes`
    );
    return res.data.data;
  }

  async create(visitId: number, payload: CreateClinicalNotePayload): Promise<ClinicalNote> {
    if (payload.notes_type === 'audio') {
      if (!payload.file) {
        throw new Error('Audio file is required for audio notes');
      }
      const form = new FormData();
      form.append('notes_type', 'audio');
      form.append('audio', payload.file);
      if (payload.doctor_id) form.append('doctor_id', payload.doctor_id);
      const res = await api.post<{ status: string; data: ClinicalNote }>(
        `${this.baseUrl}/${visitId}/clinical-notes`,
        form,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );
      return res.data.data;
    }

    const res = await api.post<{ status: string; data: ClinicalNote }>(
      `${this.baseUrl}/${visitId}/clinical-notes`,
      {
        notes_type: 'text',
        editor_notes: payload.editor_notes ?? '',
        ...(payload.doctor_id && { doctor_id: payload.doctor_id }),
      }
    );
    return res.data.data;
  }

  async update(visitId: number, noteId: number, payload: UpdateClinicalNotePayload): Promise<ClinicalNote> {
    const res = await api.put<{ status: string; data: ClinicalNote }>(
      `${this.baseUrl}/${visitId}/clinical-notes/${noteId}`,
      payload
    );
    return res.data.data;
  }

  async remove(visitId: number, noteId: number): Promise<ClinicalNote> {
    const res = await api.delete<{ status: string; data: ClinicalNote }>(
      `${this.baseUrl}/${visitId}/clinical-notes/${noteId}`
    );
    return res.data.data;
  }

  /**
   * Create clinical note with AI-generated SOAP notes
   * Saves audio, transcribes, generates SOAP notes via AI, and saves result
   */
  async createWithSoapNotes(visitId: number, file: File, doctorId?: string): Promise<ClinicalNote> {
    const form = new FormData();
    form.append('audio', file);
    if (doctorId) form.append('doctor_id', doctorId);
    const res = await api.post<{ status: string; data: ClinicalNote }>(
      `${this.baseUrl}/${visitId}/clinical-notes/soap`,
      form,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return res.data.data;
  }
}

export const clinicalNotesService = new ClinicalNotesService();
