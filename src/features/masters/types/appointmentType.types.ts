export interface AppointmentType {
  id: number;
  code: string;
  name: string;
  description?: string;
  duration_minutes: number;
  color_code?: string;
  status: number;
  createdAt: string;
  createdBy?: string;
  updatedAt: string;
  updatedBy?: string;
  deletedAt?: string;
  deletedBy?: string;
}

export interface CreateAppointmentTypePayload {
  code: string;
  name: string;
  description?: string;
  duration_minutes?: number;
  color_code?: string;
  status?: number;
}

export interface UpdateAppointmentTypePayload {
  code?: string;
  name?: string;
  description?: string;
  duration_minutes?: number;
  color_code?: string;
  status?: number;
}
