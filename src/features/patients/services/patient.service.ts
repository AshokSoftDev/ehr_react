import { api } from "@/lib/api";
import type { PatientFormData } from "../schemas/patient.schema";
import type { PaginatedPatientsResponse, Patient } from "../types/patient.types";

const getPatients = (page: number, limit: number, search: string): Promise<PaginatedPatientsResponse> => {
  const params = new URLSearchParams();
  params.append('page', String(page));
  params.append('limit', String(limit));
  if (search) {
    params.append('search', search);
  }
  return api.get(`/patients?${params.toString()}`).then((res) => res.data);
};

const getPatient = (id: number): Promise<Patient> => {
  return api.get(`/patients/${id}`).then((res) => res.data);
};

const createPatient = (data: PatientFormData): Promise<Patient> => {
  return api.post("/patients", data).then((res) => res.data);
};

const updatePatient = (id: number, data: Partial<PatientFormData>): Promise<Patient> => {
  return api.put(`/patients/${id}`, data).then((res) => res.data);
};

const deletePatient = (id: number): Promise<void> => {
  return api.delete(`/patients/${id}`).then((res) => res.data);
};

export const patientService = {
  getPatients,
  getPatient,
  createPatient,
  updatePatient,
  deletePatient,
};
