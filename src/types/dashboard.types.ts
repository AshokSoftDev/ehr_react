import type { LucideIcon } from "lucide-react";

export interface DashboardStats {
    title: string;
    value: string | number;
    change: string;
    trend: 'up' | 'down' | 'neutral';
    icon: LucideIcon;
    color: string;
    bgColor: string;
  }
  
  export interface Appointment {
    id: string;
    patient: string;
    doctor: string;
    time: string;
    type: string;
    status: 'completed' | 'in-progress' | 'scheduled' | 'cancelled';
  }
  
  export interface Alert {
    id: number;
    message: string;
    severity: 'high' | 'medium' | 'low';
    time: string;
  }
  
  export interface DepartmentData {
    name: string;
    value: number;
    patients: number;
  }
  
  export interface VisitTrend {
    day: string;
    visits: number;
    emergency: number;
  }
  
  export interface DoctorPerformance {
    name: string;
    patients: number;
    rating: number;
    specialty: string;
  }
  
  export interface ResourceUtilization {
    resource: string;
    used: number;
    total: number;
    unit: string;
  }
  