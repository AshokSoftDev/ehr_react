import type { z } from 'zod';
import type { patientSchema } from '../schemas/patient.schema';

export type Patient = z.infer<typeof patientSchema>;

export interface PaginatedPatientsResponse {
  patients: Patient[];
  total: number;
  page: number;
  limit: number;
}
