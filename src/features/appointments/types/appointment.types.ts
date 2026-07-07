export interface AppointmentDoctorLite {
  id: string;
  displayName: string;
  specialty: string;
}

export interface AppointmentPatientLite {
  patient_id: number;
  mrn: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string | Date;
  gender?: string;
  mobileNumber?: string;
  patientInfo?: {
    primaryDoctorId?: string | null;
  };
}

export interface AppointmentItem {
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
  cancellation_reason?: string;
  cancelled_by?: string;
  notes?: string;
  // snapshots
  patient_mrn: string;
  patient_title: string;
  patient_firstName: string;
  patient_lastName: string;
  doctor_title: string;
  doctor_firstName: string;
  doctor_lastName: string;
  doctor_specialty: string;
  token?: number;
  
  // includes (optional)
  patient?: AppointmentPatientLite;
  doctor?: AppointmentDoctorLite;
}

export interface CreateAppointmentInput {
  patient_id: number;
  doctor_id: string;
  appointment_date: string | Date;
  start_time: string | Date;
  end_time: string | Date;
  duration?: number;
  appointment_type: string;
  reason_for_visit?: string;
  appointment_status: string;
  cancellation_reason?: string;
  cancelled_by?: string;
  notes?: string;
}

export type UpdateAppointmentInput = Partial<CreateAppointmentInput>;

export interface AppointmentFilters {
  search?: string;
  mrn?: string;
  patientName?: string;
  doctorName?: string;
  appointment_date?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedAppointments {
  appointments: AppointmentItem[];
  total: number;
  page: number;
  totalPages: number;
}
