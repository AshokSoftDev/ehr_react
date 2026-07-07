export interface PatientVital {
  vital_id: number;
  patient_id: number;
  visit_id?: number | null;
  vital_date: string;
  vital_time?: string | null;
  weight?: number | null;
  weight_unit: string;
  height?: number | null;
  height_unit: string;
  bmi?: number | null;
  temperature?: number | null;
  temperature_unit: string;
  pulse?: number | null;
  rr?: number | null;
  bp_systolic?: number | null;
  bp_diastolic?: number | null;
  status: number;
  createdAt: string;
  createdBy?: string;
  updatedAt: string;
  updatedBy?: string;
  deletedAt?: string | null;
  deletedBy?: string | null;
  visit?: {
    visit_id: number;
    visit_type: string;
    visit_date: string;
  };
}

export interface VitalFilters {
  patientId: number;
  visitId?: number;
  page?: number;
  limit?: number;
}

export interface PaginatedVitalsResponse {
  vitals: PatientVital[];
  total: number;
  page: number;
  totalPages: number;
}

export type CreateVitalPayload = Omit<
  PatientVital,
  'vital_id' | 'status' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy' | 'deletedAt' | 'deletedBy' | 'visit' | 'patient_id'
>;

export type UpdateVitalPayload = Partial<CreateVitalPayload>;
