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
  visit_id: number;
  items: InvoiceItem[];
  gross_total: number;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  discount_amount: number;
  tax_amount: number;
  net_total: number;
  coupon_code?: string;
  discount_reason?: string;
  invoice_date: string;
  due_date?: string;
  notes?: string;
  status: 'draft' | 'sent' | 'paid' | 'cancelled';
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
  createdAt: string;
  updatedAt: string;
}

export interface Receipt {
  receipt_id: number;
  receipt_number: string;
  invoice_id: number;
  patient_id: number;
  amount: number;
  payment_method: 'cash' | 'card' | 'upi' | 'bank_transfer' | 'other';
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
  visit_id: number;
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
  status?: 'draft' | 'sent' | 'paid' | 'cancelled';
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
  from_date?: string;
  to_date?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateReceiptDto {
  invoice_id: number;
  patient_id: number;
  amount: number;
  payment_method: 'cash' | 'card' | 'upi' | 'bank_transfer' | 'other';
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
