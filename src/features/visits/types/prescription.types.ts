export interface Prescription {
  prescription_id: number;
  visit_id: number;
  appointment_id?: number | null;
  patient_id: number;
  doctor_id?: string | null;
  drug_id?: number | null;
  drug_name: string;
  drug_generic?: string | null;
  drug_type?: string | null;
  drug_dosage?: string | null;
  drug_measure?: string | null;
  instruction?: string | null;
  duration?: number | null;
  duration_type?: string | null;
  quantity?: number | null;
  morning_bf: boolean;
  morning_af: boolean;
  noon_bf: boolean;
  noon_af: boolean;
  evening_bf: boolean;
  evening_af: boolean;
  night_bf: boolean;
  night_af: boolean;
  notes?: string | null;
  status: number;
  createdAt?: string;
  createdBy?: string | null;
  updatedAt?: string;
  updatedBy?: string | null;
}

export interface CreatePrescriptionPayload {
  drug_id?: number;
  drug_name: string;
  drug_generic?: string;
  drug_type?: string;
  drug_dosage?: string;
  drug_measure?: string;
  instruction?: string;
  duration?: number;
  duration_type?: string;
  quantity?: number;
  morning_bf?: boolean;
  morning_af?: boolean;
  noon_bf?: boolean;
  noon_af?: boolean;
  evening_bf?: boolean;
  evening_af?: boolean;
  night_bf?: boolean;
  night_af?: boolean;
  notes?: string;
}

export interface UpdatePrescriptionPayload extends Partial<CreatePrescriptionPayload> {}

// Bulk create payload
export interface BulkCreatePrescriptionPayload {
  prescriptions: CreatePrescriptionPayload[];
}

// Bulk update payload - includes prescription_id for each item
export interface BulkUpdatePrescriptionItem extends UpdatePrescriptionPayload {
  prescription_id: number;
}

export interface BulkUpdatePrescriptionPayload {
  prescriptions: BulkUpdatePrescriptionItem[];
}

// Bulk delete payload
export interface BulkDeletePrescriptionPayload {
  prescriptionIds: number[];
}

// Local prescription row for UI (before saving)
export interface PrescriptionRow extends CreatePrescriptionPayload {
  id: string; // temp ID for UI
  prescription_id?: number; // existing prescription ID (if editing)
}

export interface PrescriptionTemplate {
  temp_id: number;
  template_id: number;
  template_name: string;
  drug_id?: number | null;
  drug_name: string;
  drug_generic?: string | null;
  drug_type?: string | null;
  drug_dosage?: string | null;
  drug_measure?: string | null;
  instruction?: string | null;
  duration?: number | null;
  duration_type?: string | null;
  quantity?: number | null;
  morning_bf: boolean;
  morning_af: boolean;
  noon_bf: boolean;
  noon_af: boolean;
  evening_bf: boolean;
  evening_af: boolean;
  night_bf: boolean;
  night_af: boolean;
  notes?: string | null;
  status: number;
  createdAt?: string;
}

export interface CreatePrescriptionTemplatePayload {
  template_id: number;
  template_name: string;
  drug_id?: number;
  drug_name: string;
  drug_generic?: string;
  drug_type?: string;
  drug_dosage?: string;
  drug_measure?: string;
  instruction?: string;
  duration?: number;
  duration_type?: string;
  quantity?: number;
  morning_bf?: boolean;
  morning_af?: boolean;
  noon_bf?: boolean;
  noon_af?: boolean;
  evening_bf?: boolean;
  evening_af?: boolean;
  night_bf?: boolean;
  night_af?: boolean;
  notes?: string;
}
