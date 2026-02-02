import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { billingService } from '../services/billing.service';
import type {
  InvoiceFilters,
  CreateInvoiceDto,
  UpdateInvoiceDto,
  ReceiptFilters,
  CreateReceiptDto,
} from '../types/billing.types';

// Query Keys
export const billingQueryKeys = {
  invoices: ['invoices'] as const,
  invoice: (id: number) => ['invoice', id] as const,
  visitPrescriptions: (visitId: number) => ['visit-prescriptions-for-invoice', visitId] as const,
  receipts: ['receipts'] as const,
  receipt: (id: number) => ['receipt', id] as const,
};

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
