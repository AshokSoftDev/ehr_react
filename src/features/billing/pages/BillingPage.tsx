import { useState, useMemo, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Receipt,
  Search,
  CalendarDays,
  User,
  FileText,
  CreditCard,
  Banknote,
  Smartphone,
  Building,
  Printer,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverAnchor,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { format } from "date-fns";
import { patientService } from "@/features/patients/services/patient.service";
import type { Invoice, Receipt as ReceiptType, BillingVisit, BillingVisitsFilters } from "../types/billing.types";
import { BillingVisitList } from "../components/BillingVisitList";
import { useInfiniteBillingVisits } from "../hooks/useBilling";

// Payment method icon mapping
const paymentIcons: Record<string, typeof Banknote> = {
  cash: Banknote,
  card: CreditCard,
  upi: Smartphone,
  bank_transfer: Building,
  other: CreditCard,
};

const paymentLabels: Record<string, string> = {
  cash: "Cash",
  card: "Card",
  upi: "UPI",
  bank_transfer: "Bank Transfer",
  other: "Other",
};

export function BillingPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [patientSearchQuery, setPatientSearchQuery] = useState("");
  const [patientDropdownOpen, setPatientDropdownOpen] = useState(false);
  const PAGE_SIZE = 10;
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptType | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Debounced patient search
  const [debouncedPatientQuery, setDebouncedPatientQuery] = useState("");

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedPatientQuery(patientSearchQuery);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [patientSearchQuery]);

  // Patient search query
  const { data: patientResults, isLoading: patientsLoading } = useQuery({
    queryKey: ["billing-patient-search", debouncedPatientQuery],
    queryFn: () => patientService.getPatients(1, 10, debouncedPatientQuery),
    enabled: debouncedPatientQuery.length >= 2,
  });

  // Consolidated billing visits filters
  const filters: BillingVisitsFilters = useMemo(() => ({
    status: "1",
    limit: PAGE_SIZE,
    ...(searchQuery && { search: searchQuery }),
  }), [searchQuery]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: visitsLoading,
  } = useInfiniteBillingVisits(filters);

  const visits = data?.pages.flatMap((page) => page.visits) || [];
  const totalVisits = data?.pages[0]?.total || 0;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Handle patient selection from searchable dropdown
  const handlePatientSelect = (patientId: number) => {
    setPatientDropdownOpen(false);
    setPatientSearchQuery("");
    navigate(`/main/billing/patient/${patientId}`);
  };

  // Navigate to invoice page for a visit
  const handleGenerateInvoice = (visit: BillingVisit) => {
    navigate(`/main/billing/invoice?visitId=${visit.visit_id}`);
  };

  // Navigate to view/edit existing invoice
  const handleViewInvoice = (visit: BillingVisit) => {
    navigate(`/main/billing/invoice?visitId=${visit.visit_id}`);
  };

  // View receipt in dialog
  const handleViewReceipt = (receipt: ReceiptType) => {
    setSelectedReceipt(receipt);
  };



  // Handle print receipt
  const handlePrintReceipt = (receipt: ReceiptType) => {
    const originalTitle = document.title;
    document.title = receipt.receipt_number;

    const iframe = document.createElement("iframe");
    iframe.style.position = "absolute";
    iframe.style.top = "-10000px";
    iframe.style.left = "-10000px";
    document.body.appendChild(iframe);

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${receipt.receipt_number}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; padding: 40px; }
            .container { max-width: 350px; margin: 0 auto; border: 1px solid #ddd; padding: 30px; }
            .header { text-align: center; margin-bottom: 25px; padding-bottom: 20px; border-bottom: 2px dashed #ccc; }
            .header h1 { font-size: 22px; margin-bottom: 8px; }
            .header p { color: #666; font-size: 13px; }
            .amount-box { text-align: center; background: #f0fdf4; padding: 20px; border-radius: 8px; margin-bottom: 25px; }
            .amount-label { font-size: 12px; color: #666; margin-bottom: 5px; }
            .amount-value { font-size: 36px; font-weight: bold; color: #16a34a; }
            .details { margin-bottom: 20px; }
            .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; font-size: 13px; }
            .row:last-child { border-bottom: none; }
            .label { color: #666; }
            .value { font-weight: 600; text-align: right; }
            .value small { display: block; font-weight: normal; color: #888; font-size: 11px; }
            .footer { text-align: center; margin-top: 25px; padding-top: 20px; border-top: 2px dashed #ccc; }
            .footer p { font-size: 11px; color: #888; margin: 3px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Payment Receipt</h1>
              <p>${receipt.receipt_number}</p>
            </div>
            <div class="amount-box">
              <p class="amount-label">Amount Paid</p>
              <p class="amount-value">₹${Number(receipt.amount).toFixed(2)}</p>
            </div>
            <div class="details">
              <div class="row">
                <span class="label">Patient</span>
                <span class="value">
                  ${receipt.patient?.firstName || ""} ${receipt.patient?.lastName || ""}
                  <small>MRN: ${receipt.patient?.mrn || "-"}</small>
                </span>
              </div>
              ${receipt.invoice ? `
              <div class="row">
                <span class="label">Invoice</span>
                <span class="value">${receipt.invoice.invoice_number}</span>
              </div>
              ` : ""}
              <div class="row">
                <span class="label">Payment Method</span>
                <span class="value">${paymentLabels[receipt.payment_method] || receipt.payment_method}</span>
              </div>
              <div class="row">
                <span class="label">Payment Date</span>
                <span class="value">
                  ${format(new Date(receipt.payment_date), "dd MMM yyyy")}
                  <small>${format(new Date(receipt.payment_date), "hh:mm a")}</small>
                </span>
              </div>
              ${receipt.notes ? `
              <div class="row">
                <span class="label">Notes</span>
                <span class="value">${receipt.notes}</span>
              </div>
              ` : ""}
            </div>
            <div class="footer">
              <p>Thank you for your payment!</p>
              <p>Generated on ${format(new Date(), "dd MMM yyyy, hh:mm a")}</p>
            </div>
          </div>
        </body>
        </html>
      `);
      doc.close();
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        document.title = originalTitle;
        document.body.removeChild(iframe);
      }, 1000);
    }
  };

  // Handle print invoice
  const handlePrintInvoice = (invoice: Invoice) => {
    const originalTitle = document.title;
    document.title = invoice.invoice_number;

    const iframe = document.createElement("iframe");
    iframe.style.position = "absolute";
    iframe.style.top = "-10000px";
    iframe.style.left = "-10000px";
    document.body.appendChild(iframe);

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (doc) {
      const itemsHtml = invoice.items?.map(item => `
        <tr>
          <td>
            ${item.item_name}<br>
            <small style="color:#888">${item.item_type}</small>
            ${item.notes ? `<br><small style="color:#666; font-style:italic;">Note: ${item.notes}</small>` : ''}
          </td>
          <td style="text-align:center">${item.quantity}</td>
          <td style="text-align:right">₹${Number(item.unit_amount).toFixed(2)}</td>
          <td style="text-align:right;font-weight:600">₹${Number(item.net_amount).toFixed(2)}</td>
        </tr>
      `).join("") || "";

      const statusColor = invoice.status === "paid" ? "#16a34a" : "#ea580c";
      const statusBg = invoice.status === "paid" ? "#f0fdf4" : "#fff7ed";

      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${invoice.invoice_number}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; padding: 30px; background: #fff; }
            .container { max-width: 550px; margin: 0 auto; border: 1px solid #ddd; padding: 30px; }
            .header { text-align: center; margin-bottom: 25px; padding-bottom: 20px; border-bottom: 2px dashed #ccc; }
            .header h1 { font-size: 24px; margin-bottom: 8px; color: #1e40af; }
            .header p { color: #666; font-size: 13px; }
            .status { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 11px; font-weight: 600; background: ${statusBg}; color: ${statusColor}; margin-top: 8px; }
            .info-row { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 13px; }
            .info-box { flex: 1; }
            .info-box.right { text-align: right; }
            .info-label { color: #888; font-size: 11px; margin-bottom: 3px; }
            .info-value { font-weight: 600; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th { background: #1e40af; color: white; padding: 10px; font-size: 12px; text-align: left; }
            td { padding: 10px; border-bottom: 1px solid #eee; font-size: 12px; }
            td small { font-size: 10px; }
            .totals { margin-top: 20px; border-top: 2px solid #eee; padding-top: 15px; }
            .total-row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 13px; }
            .total-row.discount { color: #16a34a; }
            .total-row.final { border-top: 2px solid #1e40af; padding-top: 10px; margin-top: 10px; font-weight: bold; font-size: 16px; }
            .total-row.final .value { color: #16a34a; }
            .footer { text-align: center; margin-top: 25px; padding-top: 20px; border-top: 2px dashed #ccc; }
            .footer p { font-size: 11px; color: #888; margin: 3px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>INVOICE</h1>
              <p>${invoice.invoice_number}</p>
              <span class="status">${invoice.status.toUpperCase()}</span>
            </div>
            <div class="info-row">
              <div class="info-box">
                <p class="info-label">Bill To</p>
                <p class="info-value">${invoice.patient?.firstName || ""} ${invoice.patient?.lastName || ""}</p>
                <p style="font-size:11px;color:#888">MRN: ${invoice.patient?.mrn || "-"}</p>
              </div>
              <div class="info-box right">
                <p class="info-label">Invoice Date</p>
                <p class="info-value">${format(new Date(invoice.invoice_date), "dd MMM yyyy")}</p>
              </div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th style="text-align:center">Qty</th>
                  <th style="text-align:right">Rate</th>
                  <th style="text-align:right">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
            <div class="totals">
              <div class="total-row">
                <span>Gross Total</span>
                <span>₹${Number(invoice.gross_total).toFixed(2)}</span>
              </div>
              ${Number(invoice.discount_amount) > 0 ? `
              <div class="total-row discount">
                <span>Discount</span>
                <span>-₹${Number(invoice.discount_amount).toFixed(2)}</span>
              </div>
              ` : ""}
              ${Number(invoice.tax_amount) > 0 ? `
              <div class="total-row">
                <span>Tax</span>
                <span>₹${Number(invoice.tax_amount).toFixed(2)}</span>
              </div>
              ` : ""}
              <div class="total-row final">
                <span>Net Total</span>
                <span class="value">₹${Number(invoice.net_total).toFixed(2)}</span>
              </div>
            </div>
            <div class="footer">
              <p>Thank you for your business!</p>
              <p>Generated on ${format(new Date(), "dd MMM yyyy, hh:mm a")}</p>
            </div>
          </div>
        </body>
        </html>
      `);
      doc.close();
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        document.title = originalTitle;
        document.body.removeChild(iframe);
      }, 1000);
    }
  };

  return (
    <div className="w-full h-[calc(100vh-4rem)] overflow-hidden">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="shrink-0 mb-4">
          <h1 className="text-xl font-semibold text-foreground">Billing</h1>
          <p className="text-sm text-muted-foreground">
            Manage invoices, payments, and receipts
          </p>
        </div>

        {/* Patient Search (Searchable Dropdown) + Visit Search */}
        <div className="shrink-0 flex items-center gap-3 mb-3">
          {/* Patient Searchable Dropdown */}
          <div className="relative max-w-sm flex-1">
            <Popover open={patientDropdownOpen} onOpenChange={setPatientDropdownOpen}>
              <PopoverAnchor asChild>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search patient by name, MRN, or phone..."
                    value={patientSearchQuery}
                    onChange={(e) => {
                      setPatientSearchQuery(e.target.value);
                      if (e.target.value.length >= 2) setPatientDropdownOpen(true);
                      else setPatientDropdownOpen(false);
                    }}
                    onFocus={() => {
                      if (patientSearchQuery.length >= 2) setPatientDropdownOpen(true);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") setPatientDropdownOpen(false);
                    }}
                    className="pl-9 h-10 border-primary/30 focus:border-primary"
                  />
                </div>
              </PopoverAnchor>
              <PopoverContent
                className="w-[400px] p-0"
                align="start"
                onOpenAutoFocus={(e) => e.preventDefault()}
              >
                <Command shouldFilter={false}>
                  <CommandList>
                    {patientsLoading ? (
                      <div className="p-3 space-y-2">
                        {[1, 2, 3].map((i) => (
                          <Skeleton key={i} className="h-10 w-full" />
                        ))}
                      </div>
                    ) : patientResults?.patients && patientResults.patients.length > 0 ? (
                      <CommandGroup heading="Select a patient to create invoice">
                        {patientResults.patients.map((patient: any) => (
                          <CommandItem
                            key={patient.patient_id}
                            value={`${patient.firstName} ${patient.lastName} ${patient.mrn}`}
                            onSelect={() => handlePatientSelect(patient.patient_id)}
                            className="flex items-center gap-3 py-2.5 cursor-pointer"
                          >
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                              <User className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {patient.firstName} {patient.lastName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                MRN: {patient.mrn} · {patient.mobileNumber}
                              </p>
                            </div>
                            <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    ) : (
                      <CommandEmpty className="py-4 text-xs">
                        {debouncedPatientQuery.length >= 2
                          ? "No patients found"
                          : "Type at least 2 characters to search"}
                      </CommandEmpty>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Visit filter search */}
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filter visits..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10"
            />
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {totalVisits} visit{totalVisits !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Visits Table */}
        <div className="flex-1 overflow-y-auto">
          {visitsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          ) : visits.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-12 text-center">
              <CalendarDays className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No visits found
              </h3>
              <p className="text-sm text-muted-foreground">
                {searchQuery ? "No visits match your search" : "No active visits available"}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <BillingVisitList 
                visits={visits}
                isLoading={visitsLoading}
                onGenerateInvoice={handleGenerateInvoice}
                onViewInvoice={handleViewInvoice}
                onViewReceipt={handleViewReceipt}
                onPrintReceipt={handlePrintReceipt}
                onPrintInvoice={handlePrintInvoice}
              />
              
              {/* Infinite scroll trigger */}
              <div ref={observerTarget} className="h-4 w-full flex items-center justify-center">
                {isFetchingNextPage && <span className="text-xs text-muted-foreground">Loading more...</span>}
              </div>
            </div>
          )}
        </div>
      </div>



      {/* Receipt Detail Dialog */}
      <Dialog open={!!selectedReceipt} onOpenChange={() => setSelectedReceipt(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Receipt Details</span>
              <Button variant="outline" size="sm" onClick={() => selectedReceipt && handlePrintReceipt(selectedReceipt)} className="gap-2">
                <Printer className="h-4 w-4" />
                Print
              </Button>
            </DialogTitle>
          </DialogHeader>

          {selectedReceipt && (
            <div>
              <div className="receipt-container">
                {/* Header */}
                <div className="header text-center mb-6">
                  <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                    <Receipt className="h-8 w-8 text-green-600" />
                  </div>
                  <h1 className="text-xl font-bold">Payment Receipt</h1>
                  <p className="text-muted-foreground text-sm">{selectedReceipt.receipt_number}</p>
                </div>

                {/* Amount */}
                <div className="amount text-center py-4 bg-green-50 rounded-lg mb-4">
                  <p className="text-xs text-muted-foreground mb-1">Amount Paid</p>
                  <p className="text-2xl font-bold text-green-600">
                    ₹{Number(selectedReceipt.amount).toFixed(2)}
                  </p>
                </div>

                <Separator className="my-4" />

                {/* Details */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Patient
                    </span>
                    <span className="font-medium text-right">
                      {selectedReceipt.patient?.firstName} {selectedReceipt.patient?.lastName}
                      <br />
                      <span className="text-xs text-muted-foreground">
                        MRN: {selectedReceipt.patient?.mrn}
                      </span>
                    </span>
                  </div>

                  {selectedReceipt.invoice && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Invoice
                      </span>
                      <span className="font-medium">
                        {selectedReceipt.invoice.invoice_number}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                      {(() => {
                        const Icon = paymentIcons[selectedReceipt.payment_method] || CreditCard;
                        return <Icon className="h-4 w-4" />;
                      })()}
                      Payment Method
                    </span>
                    <span className="font-medium">
                      {paymentLabels[selectedReceipt.payment_method] || selectedReceipt.payment_method}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <CalendarDays className="h-4 w-4" />
                      Payment Date
                    </span>
                    <span className="font-medium text-right">
                      {format(new Date(selectedReceipt.payment_date), "dd MMMM yyyy")}
                      <br />
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(selectedReceipt.payment_date), "hh:mm a")}
                      </span>
                    </span>
                  </div>

                  {selectedReceipt.notes && (
                    <>
                      <Separator />
                      <div className="text-sm">
                        <p className="text-muted-foreground text-xs mb-1">Notes</p>
                        <p>{selectedReceipt.notes}</p>
                      </div>
                    </>
                  )}
                </div>

                {/* Footer */}
                <div className="text-center mt-6 pt-4 border-t">
                  <p className="text-xs text-muted-foreground">
                    Thank you for your payment!
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Generated on {format(new Date(), "dd MMM yyyy, hh:mm a")}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}

export default BillingPage;
