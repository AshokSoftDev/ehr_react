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
  appointment_id: number;
  patient_id: number;
  doctor_id: string;
  appointment_date: string; // ISO
  start_time: string; // ISO
  end_time: string; // ISO
  duration?: number;
  appointment_type: string;
  reason_for_visit?: string;
  appointment_status: string;
  notes?: string;
  patient?: VisitPatientLite;
  doctor?: VisitDoctorLite;
}

export interface VisitFilters {
  dateFrom?: string;
  dateTo?: string;
  doctor?: string;
  patient?: string; // name or MRN
  reason?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedVisits {
  visits: VisitItem[];
  total: number;
  page: number;
  totalPages: number;
}

