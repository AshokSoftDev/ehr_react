import { useState, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Receipt,
  Search,
  CalendarDays,
  User,
  CreditCard,
  Banknote,
  Smartphone,
  Building,
  FileText,
  Printer,
  Eye,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { billingService } from "../services/billing.service";
import type { Receipt as ReceiptType, Invoice, ReceiptFilters } from "../types/billing.types";

// Payment method icon mapping
const paymentIcons = {
  cash: Banknote,
  card: CreditCard,
  upi: Smartphone,
  bank_transfer: Building,
  other: CreditCard,
};

// Payment method labels
const paymentLabels = {
  cash: "Cash",
  card: "Card",
  upi: "UPI",
  bank_transfer: "Bank Transfer",
  other: "Other",
};

export function ReceiptPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptType | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isLoadingInvoice, setIsLoadingInvoice] = useState(false);
  const printReceiptRef = useRef<HTMLDivElement>(null);
  const printInvoiceRef = useRef<HTMLDivElement>(null);

  // Filters for receipts
  const receiptFilters: ReceiptFilters = useMemo(() => ({
    page: 1,
    limit: 50,
    ...(searchQuery && { search: searchQuery }),
  }), [searchQuery]);

  // Fetch receipts
  const { data: receiptsData, isLoading } = useQuery({
    queryKey: ["receipts", receiptFilters],
    queryFn: () => billingService.listReceipts(receiptFilters),
  });

  const receipts = receiptsData?.receipts || [];

  // Handle print receipt using hidden iframe - accepts receipt directly or uses selectedReceipt
  const handlePrintReceipt = (receiptToPrint?: ReceiptType) => {
    const receipt = receiptToPrint || selectedReceipt;
    if (!receipt) return;
    
    // Save original title and change to receipt number for PDF filename
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
                <span class="value">${paymentLabels[receipt.payment_method]}</span>
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
      
      // Restore original title and remove iframe after print
      setTimeout(() => {
        document.title = originalTitle;
        document.body.removeChild(iframe);
      }, 1000);
    }
  };

  // Handle print invoice using hidden iframe
  const handlePrintInvoice = () => {
    if (!selectedInvoice) return;

    
    // Save original title and change to invoice number for PDF filename
    const originalTitle = document.title;
    document.title = selectedInvoice.invoice_number;
    
    const iframe = document.createElement("iframe");
    iframe.style.position = "absolute";
    iframe.style.top = "-10000px";
    iframe.style.left = "-10000px";
    document.body.appendChild(iframe);
    
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (doc) {
      // Generate items HTML
      const itemsHtml = selectedInvoice.items?.map(item => `
        <tr>
          <td>${item.item_name}<br><small style="color:#888">${item.item_type}</small></td>
          <td style="text-align:center">${item.quantity}</td>
          <td style="text-align:right">₹${Number(item.unit_amount).toFixed(2)}</td>
          <td style="text-align:right;font-weight:600">₹${Number(item.net_amount).toFixed(2)}</td>
        </tr>
      `).join("") || "";

      const statusColor = selectedInvoice.status === "paid" ? "#16a34a" : "#ea580c";
      const statusBg = selectedInvoice.status === "paid" ? "#f0fdf4" : "#fff7ed";

      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${selectedInvoice.invoice_number}</title>
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
              <p>${selectedInvoice.invoice_number}</p>
              <span class="status">${selectedInvoice.status.toUpperCase()}</span>
            </div>
            
            <div class="info-row">
              <div class="info-box">
                <p class="info-label">Bill To</p>
                <p class="info-value">${selectedInvoice.patient?.firstName || ""} ${selectedInvoice.patient?.lastName || ""}</p>
                <p style="font-size:11px;color:#888">MRN: ${selectedInvoice.patient?.mrn || "-"}</p>
              </div>
              <div class="info-box right">
                <p class="info-label">Invoice Date</p>
                <p class="info-value">${format(new Date(selectedInvoice.invoice_date), "dd MMM yyyy")}</p>
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
                <span>₹${Number(selectedInvoice.gross_total).toFixed(2)}</span>
              </div>
              ${Number(selectedInvoice.discount_amount) > 0 ? `
              <div class="total-row discount">
                <span>Discount</span>
                <span>-₹${Number(selectedInvoice.discount_amount).toFixed(2)}</span>
              </div>
              ` : ""}
              ${Number(selectedInvoice.tax_amount) > 0 ? `
              <div class="total-row">
                <span>Tax</span>
                <span>₹${Number(selectedInvoice.tax_amount).toFixed(2)}</span>
              </div>
              ` : ""}
              <div class="total-row final">
                <span>Net Total</span>
                <span class="value">₹${Number(selectedInvoice.net_total).toFixed(2)}</span>
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
      
      // Restore original title and remove iframe after print
      setTimeout(() => {
        document.title = originalTitle;
        document.body.removeChild(iframe);
      }, 1000);
    }
  };



  // Handle view invoice
  const handleViewInvoice = async (invoiceId: number) => {
    setIsLoadingInvoice(true);
    try {
      const invoice = await billingService.getInvoice(invoiceId);
      setSelectedInvoice(invoice);
    } catch {
      console.error("Failed to load invoice");
    } finally {
      setIsLoadingInvoice(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            Receipts
          </h2>
          <p className="text-sm text-muted-foreground">
            View and print payment receipts
          </p>
        </div>
      </div>

      <Separator />

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by patient name or receipt number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Receipt List - Full Width Table */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : receipts.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-12 text-center">
          <Receipt className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            No receipts found
          </h3>
          <p className="text-sm text-muted-foreground">
            {searchQuery
              ? "No receipts match your search"
              : "Receipts are generated when invoices are paid"}
          </p>
        </div>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr className="text-left text-xs font-medium text-muted-foreground">
                <th className="px-4 py-3">Receipt #</th>
                <th className="px-4 py-3">Patient</th>
                <th className="px-4 py-3">Invoice</th>
                <th className="px-4 py-3">Payment Method</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {receipts.map((receipt) => {
                const PaymentIcon = paymentIcons[receipt.payment_method] || CreditCard;
                const paymentDate = new Date(receipt.payment_date);

                return (
                  <tr
                    key={receipt.receipt_id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span className="font-medium text-sm">{receipt.receipt_number}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium">
                          {receipt.patient?.firstName} {receipt.patient?.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          MRN: {receipt.patient?.mrn}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {receipt.invoice ? (
                        <button
                          onClick={() => handleViewInvoice(receipt.invoice!.invoice_id)}
                          className="text-sm text-primary hover:underline font-medium"
                        >
                          {receipt.invoice.invoice_number}
                        </button>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary" className="text-xs gap-1">
                        <PaymentIcon className="h-3 w-3" />
                        {paymentLabels[receipt.payment_method]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        <p>{format(paymentDate, "dd MMM yyyy")}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(paymentDate, "hh:mm a")}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-bold text-green-600">
                        ₹{Number(receipt.amount).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedReceipt(receipt)}
                          className="h-8 w-8 p-0 hover:bg-blue-50"
                          title="View Receipt"
                        >
                          <Eye className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePrintReceipt(receipt)}
                          className="h-8 w-8 p-0 hover:bg-green-50"
                          title="Print Receipt"
                        >
                          <Printer className="h-4 w-4 text-green-600" />
                        </Button>

                      </div>

                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Receipt Detail Dialog */}
      <Dialog open={!!selectedReceipt} onOpenChange={() => setSelectedReceipt(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Receipt Details</span>
              <Button variant="outline" size="sm" onClick={() => handlePrintReceipt()} className="gap-2">
                <Printer className="h-4 w-4" />
                Print
              </Button>

            </DialogTitle>
          </DialogHeader>

          {selectedReceipt && (
            <div ref={printReceiptRef}>
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
                        const Icon = paymentIcons[selectedReceipt.payment_method];
                        return <Icon className="h-4 w-4" />;
                      })()}
                      Payment Method
                    </span>
                    <span className="font-medium">
                      {paymentLabels[selectedReceipt.payment_method]}
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

      {/* Invoice Detail Dialog */}
      <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Invoice Details</span>
              <Button variant="outline" size="sm" onClick={handlePrintInvoice} className="gap-2">
                <Printer className="h-4 w-4" />
                Print Invoice
              </Button>
            </DialogTitle>
          </DialogHeader>

          {isLoadingInvoice ? (
            <div className="space-y-3">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : selectedInvoice && (
            <div ref={printInvoiceRef}>
              <div className="invoice-container">
                {/* Header */}
                <div className="text-center mb-6">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <FileText className="h-8 w-8 text-primary" />
                  </div>
                  <h1 className="text-xl font-bold">Invoice</h1>
                  <p className="text-muted-foreground text-sm">{selectedInvoice.invoice_number}</p>
                  <Badge 
                    className={selectedInvoice.status === "paid" 
                      ? "bg-green-100 text-green-700 mt-2" 
                      : "bg-orange-100 text-orange-700 mt-2"}
                  >
                    {selectedInvoice.status.toUpperCase()}
                  </Badge>
                </div>

                {/* Patient & Date Info */}
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Patient</p>
                    <p className="font-medium">
                      {selectedInvoice.patient?.firstName} {selectedInvoice.patient?.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      MRN: {selectedInvoice.patient?.mrn}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-muted-foreground text-xs">Invoice Date</p>
                    <p className="font-medium">
                      {format(new Date(selectedInvoice.invoice_date), "dd MMM yyyy")}
                    </p>
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Items Table */}
                <div className="rounded border overflow-hidden mb-4">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium">Item</th>
                        <th className="px-3 py-2 text-center font-medium">Qty</th>
                        <th className="px-3 py-2 text-right font-medium">Rate</th>
                        <th className="px-3 py-2 text-right font-medium">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {selectedInvoice.items?.map((item, idx) => (
                        <tr key={idx}>
                          <td className="px-3 py-2">
                            <p className="font-medium">{item.item_name}</p>
                            <p className="text-xs text-muted-foreground">{item.item_type}</p>
                          </td>
                          <td className="px-3 py-2 text-center">{item.quantity}</td>
                          <td className="px-3 py-2 text-right">₹{Number(item.unit_amount).toFixed(2)}</td>
                          <td className="px-3 py-2 text-right font-medium">₹{Number(item.net_amount).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Gross Total</span>
                    <span>₹{Number(selectedInvoice.gross_total).toFixed(2)}</span>
                  </div>
                  {Number(selectedInvoice.discount_amount) > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-₹{Number(selectedInvoice.discount_amount).toFixed(2)}</span>
                    </div>
                  )}
                  {Number(selectedInvoice.tax_amount) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tax</span>
                      <span>₹{Number(selectedInvoice.tax_amount).toFixed(2)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Net Total</span>
                    <span className="text-green-600">₹{Number(selectedInvoice.net_total).toFixed(2)}</span>
                  </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-6 pt-4 border-t">
                  <p className="text-xs text-muted-foreground">
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

export default ReceiptPage;
