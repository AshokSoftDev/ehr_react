export interface InvoiceItem {
  item_id?: number;
  item_type: 'drug' | 'procedure' | 'package' | 'custom';
  item_name: string;
  reference_id?: number;
  quantity: number;
  unit_amount: number;
  premium: number;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  discount_amount: number;
  tax_applicable: boolean;
  net_amount: number;
  notes?: string;
  assigned_user?: string;
}

export interface Invoice {
  invoice_id: number;
  invoice_number: string;
  patient_id: number;
  visit_id?: number; // Optional — invoices can exist without a visit
  items: InvoiceItem[];
  gross_total: number;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  discount_amount: number;
  tax_amount: number;
  net_total: number;
  paid_amount: number;
  balance_amount: number;
  coupon_code?: string;
  discount_reason?: string;
  invoice_date: string;
  due_date?: string;
  notes?: string;
  status: 'draft' | 'sent' | 'partial' | 'paid' | 'cancelled';
  patient?: {
    patient_id: number;
    firstName: string;
    lastName: string;
    mrn: string;
  };
  visit?: {
    visit_id: number;
    visit_type: string;
    visit_date: string;
  };
  receipts?: Receipt[];
  createdAt: string;
  updatedAt: string;
}

export interface Receipt {
  receipt_id: number;
  receipt_number: string;
  invoice_id?: number; // Optional — advance deposits have no invoice
  patient_id: number;
  amount: number;
  payment_method: 'cash' | 'card' | 'upi' | 'bank_transfer' | 'other';
  receipt_type: 'payment' | 'advance_deposit' | 'advance_deduction';
  payment_date: string;
  notes?: string;
  invoice?: {
    invoice_id: number;
    invoice_number: string;
    net_total: number;
  };
  patient?: {
    patient_id: number;
    firstName: string;
    lastName: string;
    mrn: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateInvoiceItemDto {
  item_type: 'drug' | 'procedure' | 'package' | 'custom';
  item_name: string;
  reference_id?: number;
  quantity?: number;
  unit_amount?: number;
  premium?: number;
  discount_type?: 'percentage' | 'fixed';
  discount_value?: number;
  tax_applicable?: boolean;
  notes?: string;
  assigned_user?: string;
}

export interface CreateInvoiceDto {
  patient_id: number;
  visit_id?: number; // Optional
  items: CreateInvoiceItemDto[];
  discount_type?: 'percentage' | 'fixed';
  discount_value?: number;
  coupon_code?: string;
  discount_reason?: string;
  invoice_date?: string;
  due_date?: string;
  notes?: string;
}

export interface UpdateInvoiceDto {
  items?: CreateInvoiceItemDto[];
  discount_type?: 'percentage' | 'fixed';
  discount_value?: number;
  coupon_code?: string;
  discount_reason?: string;
  invoice_date?: string;
  due_date?: string;
  notes?: string;
  status?: 'draft' | 'sent' | 'partial' | 'paid' | 'cancelled';
}

export interface InvoiceFilters {
  patient_id?: number;
  visit_id?: number;
  status?: string;
  from_date?: string;
  to_date?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ReceiptFilters {
  invoice_id?: number;
  patient_id?: number;
  payment_method?: string;
  receipt_type?: string;
  from_date?: string;
  to_date?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateReceiptDto {
  invoice_id?: number; // Optional
  patient_id: number;
  amount: number;
  payment_method: 'cash' | 'card' | 'upi' | 'bank_transfer' | 'other';
  receipt_type?: 'payment' | 'advance_deposit' | 'advance_deduction';
  payment_date?: string;
  notes?: string;
}

export interface PaginatedInvoicesResponse {
  invoices: Invoice[];
  total: number;
  page: number;
  totalPages: number;
}

export interface PaginatedReceiptsResponse {
  receipts: Receipt[];
  total: number;
  page: number;
  totalPages: number;
}

// For frontend invoice form state
export interface InvoiceItemRow extends CreateInvoiceItemDto {
  _id: string; // Temporary ID for UI
  discount_amount?: number;
  net_amount?: number;
}

// Consolidated billing visit types
export interface BillingVisitInvoice extends Invoice {
  receipts: Receipt[];
}

export interface BillingVisit {
  visit_id: number;
  appointment_id?: number;
  patient_id: number;
  visit_date: string;
  visit_type: string;
  reason_for_visit?: string;
  status: number;
  patient: {
    patient_id: number;
    firstName: string;
    lastName: string;
    mrn: string;
    mobileNumber: string;
  };
  doctor?: {
    id: string;
    displayName: string;
  };
  appointment?: {
    appointment_id: number;
    appointment_type: string;
  };
  invoices: BillingVisitInvoice[];
}

export interface BillingVisitsFilters {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedBillingVisitsResponse {
  visits: BillingVisit[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============================================
// Advance / Wallet types
// ============================================

export interface PatientAdvance {
  advance_id: number;
  patient_id: number;
  amount: number;
  transaction_type: 'deposit' | 'deduction';
  reference_type?: string;
  reference_id?: number;
  payment_method?: string;
  receipt_id?: number;
  notes?: string;
  status: number;
  createdAt: string;
  patient?: {
    patient_id: number;
    firstName: string;
    lastName: string;
    mrn: string;
  };
}

export interface AdvanceBalanceResponse {
  patient_id: number;
  balance: number;
}

export interface CreateAdvanceDto {
  patient_id: number;
  amount: number;
  payment_method: 'cash' | 'card' | 'upi' | 'bank_transfer' | 'other';
  notes?: string;
}

export interface AdvanceFilters {
  transaction_type?: 'deposit' | 'deduction';
  page?: number;
  limit?: number;
}

export interface PaginatedAdvancesResponse {
  advances: PatientAdvance[];
  total: number;
  page: number;
  totalPages: number;
}

export interface DepositAdvanceResponse {
  advance: PatientAdvance;
  balance: number;
}

// ============================================
// Payment types (from invoice page)
// ============================================

export interface CreatePaymentDto {
  invoice_id: number;
  patient_id: number;
  amount: number;
  payment_method: 'cash' | 'card' | 'upi' | 'bank_transfer' | 'other';
  from_advance?: number;
  payment_date?: string;
  notes?: string;
}

export interface PaymentResult {
  receipts: Receipt[];
  advance_deduction?: PatientAdvance;
  invoice: Invoice;
  advance_balance: number;
}
