export interface VisitDoctorLite {
  id: string;
  displayName: string;
  specialty: string;
}

export interface VisitPatientLite {
  patient_id: number;
  mrn: string;
  title?: string;
  firstName?: string;
  lastName?: string;
  gender?: string;
  age?: number;
  mobileNumber?: string;
}

export interface VisitItem {
  visit_id: number;
  appointment_id?: number | null;
  patient_id: number;
  doctor_id: string;
  location_id?: number | null;
  visit_date: string; // ISO
  visit_type: string;
  reason_for_visit?: string | null;
  status: number;
  patient?: VisitPatientLite;
  doctor?: VisitDoctorLite;
  appointment?: {
    appointment_id: number;
    appointment_type: string;
  } | null;
}

export interface VisitFilters {
  dateFrom?: string;
  dateTo?: string;
  doctor?: string;
  doctor_id?: string; // direct doctor ID filter
  patient?: string; // name or MRN
  patient_id?: number; // direct patient ID filter
  reason?: string;
  status?: string; // '1' or '0' (active/inactive)
  page?: number;
  limit?: number;
}

export interface PaginatedVisits {
  visits: VisitItem[];
  total: number;
  page: number;
  totalPages: number;
}
