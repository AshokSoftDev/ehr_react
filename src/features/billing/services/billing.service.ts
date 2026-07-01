import { api } from '@/lib/api';
import type {
  Invoice,
  Receipt,
  CreateInvoiceDto,
  UpdateInvoiceDto,
  InvoiceFilters,
  CreateReceiptDto,
  ReceiptFilters,
  PaginatedInvoicesResponse,
  PaginatedReceiptsResponse,
  CreateInvoiceItemDto,
  BillingVisitsFilters,
  PaginatedBillingVisitsResponse,
  CreateAdvanceDto,
  AdvanceBalanceResponse,
  AdvanceFilters,
  PaginatedAdvancesResponse,
  DepositAdvanceResponse,
  CreatePaymentDto,
  PaymentResult,
} from '../types/billing.types';

const BASE_URL = '/billing';

export const billingService = {
  // Consolidated billing visits
  listBillingVisits: async (filters?: BillingVisitsFilters): Promise<PaginatedBillingVisitsResponse> => {
    const response = await api.get<PaginatedBillingVisitsResponse>(`${BASE_URL}/visits`, { params: filters });
    return response.data;
  },

  // Invoice APIs
  listInvoices: async (filters?: InvoiceFilters): Promise<PaginatedInvoicesResponse> => {
    const response = await api.get<PaginatedInvoicesResponse>(`${BASE_URL}/invoices`, { params: filters });
    return response.data;
  },

  getInvoice: async (id: number): Promise<Invoice> => {
    const response = await api.get<Invoice>(`${BASE_URL}/invoices/${id}`);
    return response.data;
  },

  createInvoice: async (data: CreateInvoiceDto): Promise<Invoice> => {
    const response = await api.post<Invoice>(`${BASE_URL}/invoices`, data);
    return response.data;
  },

  updateInvoice: async (id: number, data: UpdateInvoiceDto): Promise<Invoice> => {
    const response = await api.put<Invoice>(`${BASE_URL}/invoices/${id}`, data);
    return response.data;
  },

  deleteInvoice: async (id: number): Promise<void> => {
    await api.delete(`${BASE_URL}/invoices/${id}`);
  },

  // Get visit prescriptions formatted for invoice
  getVisitPrescriptionsForInvoice: async (visitId: number): Promise<CreateInvoiceItemDto[]> => {
    const response = await api.get<CreateInvoiceItemDto[]>(`${BASE_URL}/visits/${visitId}/prescriptions-for-invoice`);
    return response.data;
  },

  // Get pending invoices for a patient
  getPatientPendingInvoices: async (patientId: number): Promise<Invoice[]> => {
    const response = await api.get<Invoice[]>(`${BASE_URL}/invoices/patient/${patientId}/pending`);
    return response.data;
  },

  // Receipt APIs
  listReceipts: async (filters?: ReceiptFilters): Promise<PaginatedReceiptsResponse> => {
    const response = await api.get<PaginatedReceiptsResponse>(`${BASE_URL}/receipts`, { params: filters });
    return response.data;
  },

  getReceipt: async (id: number): Promise<Receipt> => {
    const response = await api.get<Receipt>(`${BASE_URL}/receipts/${id}`);
    return response.data;
  },

  createReceipt: async (data: CreateReceiptDto): Promise<Receipt> => {
    const response = await api.post<Receipt>(`${BASE_URL}/receipts`, data);
    return response.data;
  },

  updateReceipt: async (id: number, data: Partial<CreateReceiptDto>): Promise<Receipt> => {
    const response = await api.put<Receipt>(`${BASE_URL}/receipts/${id}`, data);
    return response.data;
  },

  deleteReceipt: async (id: number): Promise<void> => {
    await api.delete(`${BASE_URL}/receipts/${id}`);
  },

  // ============================================
  // Advance / Wallet APIs
  // ============================================

  depositAdvance: async (data: CreateAdvanceDto): Promise<DepositAdvanceResponse> => {
    const response = await api.post<DepositAdvanceResponse>(`${BASE_URL}/advance`, data);
    return response.data;
  },

  getAdvanceBalance: async (patientId: number): Promise<AdvanceBalanceResponse> => {
    const response = await api.get<AdvanceBalanceResponse>(`${BASE_URL}/advance/balance/${patientId}`);
    return response.data;
  },

  getAdvanceLedger: async (patientId: number, filters?: AdvanceFilters): Promise<PaginatedAdvancesResponse> => {
    const response = await api.get<PaginatedAdvancesResponse>(`${BASE_URL}/advance/ledger/${patientId}`, { params: filters });
    return response.data;
  },

  // ============================================
  // Payment APIs
  // ============================================

  createPayment: async (data: CreatePaymentDto): Promise<PaymentResult> => {
    const response = await api.post<PaymentResult>(`${BASE_URL}/payments`, data);
    return response.data;
  },

  getInvoicePayments: async (invoiceId: number): Promise<Receipt[]> => {
    const response = await api.get<Receipt[]>(`${BASE_URL}/payments/invoice/${invoiceId}`);
    return response.data;
  },
};
