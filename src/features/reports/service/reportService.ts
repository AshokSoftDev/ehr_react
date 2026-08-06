import { api } from '@/lib/api';

export interface ReportCatalogItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  availableGroupings: string[];
  charts: string[];
}

export interface ReportFilterPayload {
  dateFrom?: string;
  dateTo?: string;
  doctor_id?: string;
  status?: string;
  payment_method?: string;
  groupBy?: string;
  gender?: string;
  city?: string;
  type?: string;
  location_id?: number;
}

export interface CustomReportQuery {
  dataSource: 'invoices' | 'appointments' | 'visits' | 'patients' | 'receipts';
  dateFrom?: string;
  dateTo?: string;
  filters?: Record<string, any>;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export const reportService = {
  getCatalog: async (): Promise<{ data: ReportCatalogItem[] }> => {
    const response = await api.get('/reports/catalog');
    return response.data;
  },

  getFinancialReport: async (params: ReportFilterPayload = {}) => {
    const response = await api.get('/reports/financial', { params });
    return response.data;
  },

  getClinicalReport: async (params: ReportFilterPayload = {}) => {
    const response = await api.get('/reports/clinical', { params });
    return response.data;
  },

  getOperationalReport: async (params: ReportFilterPayload = {}) => {
    const response = await api.get('/reports/operational', { params });
    return response.data;
  },

  getDemographicsReport: async (params: ReportFilterPayload = {}) => {
    const response = await api.get('/reports/demographics', { params });
    return response.data;
  },

  getCustomReport: async (body: CustomReportQuery) => {
    const response = await api.post('/reports/custom', body);
    return response.data;
  },

  generateAiInsight: async (query: string, context?: Record<string, any>) => {
    const response = await api.post('/reports/ai-insight', { query, context });
    return response.data;
  },
};
