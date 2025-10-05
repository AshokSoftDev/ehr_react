export interface Doctor {
    id: string;
    title: string;
    firstName: string;
    lastName: string;
    dob: string;
    email: string;
    licenceNo: string;
    degree: string;
    specialty: string;
    timeBlock?: string;
    displayName: string;
    displayColor: string;
    address?: string;
    area?: string;
    city?: string;
    state?: string;
    country?: string;
    pincode?: string;
    status: number;
    createdAt: string;
    createdBy?: string;
    updatedAt: string;
    updatedBy?: string;
    deletedAt?: string;
    deletedBy?: string;
  }
  
  export interface CreateDoctorDto {
    title: string;
    firstName: string;
    lastName: string;
    dob: string;
    email: string;
    licenceNo: string;
    degree: string;
    specialty: string;
    timeBlock?: string;
    displayName: string;
    displayColor: string;
    address?: string;
    area?: string;
    city?: string;
    state?: string;
    country?: string;
    pincode?: string;
  }
  
  export interface UpdateDoctorDto extends Partial<CreateDoctorDto> {
    status?: number;
  }
  
  export interface DoctorFiltersType {
    search?: string;
    specialty?: string;
    status?: number;
    email?: string;
    licenceNo?: string;
  }
  
  export interface PaginationParams {
    page?: number;
    limit?: number;
  }
  
  export interface DoctorListResponse {
    doctors: Doctor[];
    total: number;
    page: number;
    totalPages: number;
  }
  