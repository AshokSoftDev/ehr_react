import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/lib/toast';
import type {
  ClinicalNote,
  CreateClinicalNotePayload,
  UpdateClinicalNotePayload,
} from '../types/clinicalNote.types';
import { clinicalNotesService } from '../services/clinicalNotes.service';

const key = (visitId: number) => ['clinical-notes', visitId];

export function useClinicalNotes(visitId?: number) {
  return useQuery({
    queryKey: visitId ? key(visitId) : ['clinical-notes'],
    queryFn: () => clinicalNotesService.list(visitId as number),
    enabled: !!visitId,
  });
}

export function useCreateClinicalNote(visitId?: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateClinicalNotePayload) => {
      if (!visitId) throw new Error('visitId is required');
      return clinicalNotesService.create(visitId, payload);
    },
    onSuccess: () => {
      if (visitId) qc.invalidateQueries({ queryKey: key(visitId) });
      toast.success('Clinical note saved');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to save note');
    },
  });
}

export function useUpdateClinicalNote(visitId?: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ noteId, payload }: { noteId: number; payload: UpdateClinicalNotePayload }) => {
      if (!visitId) throw new Error('visitId is required');
      return clinicalNotesService.update(visitId, noteId, payload);
    },
    onSuccess: () => {
      if (visitId) qc.invalidateQueries({ queryKey: key(visitId) });
      toast.success('Clinical note updated');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to update note');
    },
  });
}

export function useDeleteClinicalNote(visitId?: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (noteId: number) => {
      if (!visitId) throw new Error('visitId is required');
      return clinicalNotesService.remove(visitId, noteId);
    },
    onSuccess: () => {
      if (visitId) qc.invalidateQueries({ queryKey: key(visitId) });
      toast.success('Clinical note removed');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to delete note');
    },
  });
}
