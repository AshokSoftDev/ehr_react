import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { billingService } from '../services/billing.service';
import type {
  InvoiceFilters,
  CreateInvoiceDto,
  UpdateInvoiceDto,
  ReceiptFilters,
  CreateReceiptDto,
  CreateAdvanceDto,
  AdvanceFilters,
  CreatePaymentDto,
} from '../types/billing.types';

// Query Keys
export const billingQueryKeys = {
  invoices: ['invoices'] as const,
  invoice: (id: number) => ['invoice', id] as const,
  visitPrescriptions: (visitId: number) => ['visit-prescriptions-for-invoice', visitId] as const,
  receipts: ['receipts'] as const,
  receipt: (id: number) => ['receipt', id] as const,
  advanceBalance: (patientId: number) => ['advance-balance', patientId] as const,
  advanceLedger: (patientId: number) => ['advance-ledger', patientId] as const,
  pendingInvoices: (patientId: number) => ['pending-invoices', patientId] as const,
  invoicePayments: (invoiceId: number) => ['invoice-payments', invoiceId] as const,
  billingVisits: ['billing-visits'] as const,
};

export function useInfiniteBillingVisits(filters?: import('../types/billing.types').BillingVisitsFilters) {
  return useInfiniteQuery({
    queryKey: [...billingQueryKeys.billingVisits, filters],
    queryFn: ({ pageParam = 1 }) => billingService.listBillingVisits({ ...filters, page: pageParam as number }),
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });
}

// Invoice Hooks
export function useInvoices(filters?: InvoiceFilters) {
  return useQuery({
    queryKey: [...billingQueryKeys.invoices, filters],
    queryFn: () => billingService.listInvoices(filters),
  });
}

export function useInvoice(id: number) {
  return useQuery({
    queryKey: billingQueryKeys.invoice(id),
    queryFn: () => billingService.getInvoice(id),
    enabled: id > 0,
  });
}

export function useVisitPrescriptionsForInvoice(visitId: number) {
  return useQuery({
    queryKey: billingQueryKeys.visitPrescriptions(visitId),
    queryFn: () => billingService.getVisitPrescriptionsForInvoice(visitId),
    enabled: visitId > 0,
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateInvoiceDto) => billingService.createInvoice(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billingQueryKeys.invoices });
    },
  });
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateInvoiceDto }) =>
      billingService.updateInvoice(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: billingQueryKeys.invoices });
      queryClient.invalidateQueries({ queryKey: billingQueryKeys.invoice(variables.id) });
    },
  });
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => billingService.deleteInvoice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billingQueryKeys.invoices });
    },
  });
}

// Receipt Hooks
export function useReceipts(filters?: ReceiptFilters) {
  return useQuery({
    queryKey: [...billingQueryKeys.receipts, filters],
    queryFn: () => billingService.listReceipts(filters),
  });
}

export function useReceipt(id: number) {
  return useQuery({
    queryKey: billingQueryKeys.receipt(id),
    queryFn: () => billingService.getReceipt(id),
    enabled: id > 0,
  });
}

export function useCreateReceipt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateReceiptDto) => billingService.createReceipt(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billingQueryKeys.receipts });
      queryClient.invalidateQueries({ queryKey: billingQueryKeys.invoices });
    },
  });
}

export function useUpdateReceipt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateReceiptDto> }) =>
      billingService.updateReceipt(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: billingQueryKeys.receipts });
      queryClient.invalidateQueries({ queryKey: billingQueryKeys.receipt(variables.id) });
    },
  });
}

export function useDeleteReceipt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => billingService.deleteReceipt(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billingQueryKeys.receipts });
    },
  });
}

// ============================================
// Advance / Wallet Hooks
// ============================================

export function useAdvanceBalance(patientId: number) {
  return useQuery({
    queryKey: billingQueryKeys.advanceBalance(patientId),
    queryFn: () => billingService.getAdvanceBalance(patientId),
    enabled: patientId > 0,
  });
}

export function useAdvanceLedger(patientId: number, filters?: AdvanceFilters) {
  return useQuery({
    queryKey: [...billingQueryKeys.advanceLedger(patientId), filters],
    queryFn: () => billingService.getAdvanceLedger(patientId, filters),
    enabled: patientId > 0,
  });
}

export function useDepositAdvance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAdvanceDto) => billingService.depositAdvance(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: billingQueryKeys.advanceBalance(variables.patient_id) });
      queryClient.invalidateQueries({ queryKey: billingQueryKeys.advanceLedger(variables.patient_id) });
      queryClient.invalidateQueries({ queryKey: billingQueryKeys.receipts });
    },
  });
}

// ============================================
// Payment Hooks
// ============================================

export function useCreatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePaymentDto) => billingService.createPayment(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: billingQueryKeys.invoices });
      queryClient.invalidateQueries({ queryKey: billingQueryKeys.invoice(variables.invoice_id) });
      queryClient.invalidateQueries({ queryKey: billingQueryKeys.advanceBalance(variables.patient_id) });
      queryClient.invalidateQueries({ queryKey: billingQueryKeys.advanceLedger(variables.patient_id) });
      queryClient.invalidateQueries({ queryKey: billingQueryKeys.pendingInvoices(variables.patient_id) });
      queryClient.invalidateQueries({ queryKey: billingQueryKeys.invoicePayments(variables.invoice_id) });
      queryClient.invalidateQueries({ queryKey: billingQueryKeys.receipts });
    },
  });
}

export function usePatientPendingInvoices(patientId: number) {
  return useQuery({
    queryKey: billingQueryKeys.pendingInvoices(patientId),
    queryFn: () => billingService.getPatientPendingInvoices(patientId),
    enabled: patientId > 0,
  });
}

export function useInvoicePayments(invoiceId: number) {
  return useQuery({
    queryKey: billingQueryKeys.invoicePayments(invoiceId),
    queryFn: () => billingService.getInvoicePayments(invoiceId),
    enabled: invoiceId > 0,
  });
}
