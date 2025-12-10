export interface DentalHPI {
  hpi_id: number;
  visit_id: number;
  patient_id: number;
  doctor_id?: string;
  dentition_type: 'primary' | 'mixed' | 'permanent';
  teeth_surfaces: Record<string, string[]>; // { "18": ["center", "leftTop"] }
  chief_complaints: string[];
  severity?: 'mild' | 'moderate' | 'severe';
  duration_years: number;
  duration_months: number;
  duration_weeks: number;
  duration_days: number;
  notes?: string;
  status: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDentalHPIPayload {
  dentition_type: 'primary' | 'mixed' | 'permanent';
  teeth_surfaces: Record<string, string[]>;
  chief_complaints: string[];
  severity?: 'mild' | 'moderate' | 'severe';
  duration_years?: number;
  duration_months?: number;
  duration_weeks?: number;
  duration_days?: number;
  notes?: string;
}

export interface UpdateDentalHPIPayload extends Partial<CreateDentalHPIPayload> {}
