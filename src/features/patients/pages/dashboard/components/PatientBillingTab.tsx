import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  FileText, 
  Banknote, 
  CreditCard as CreditCardIcon, 
  Loader2,
  Receipt,
  Eye,
  Printer,
  User,
  CalendarDays,
  Smartphone,
  Building,
  CreditCard
} from 'lucide-react';
import { billingService } from '@/features/billing/services/billing.service';
import type { Receipt as ReceiptType } from '@/features/billing/types/billing.types';

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

type Props = {
  patientId: number;
};

export function PatientBillingTab({ patientId }: Props) {
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptType | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['patient-receipts', patientId],
    queryFn: () => billingService.listReceipts({ patient_id: patientId, limit: 100 }),
    enabled: Number.isFinite(patientId) && patientId > 0,
  });

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

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8 text-sm text-destructive">
          Error loading receipts.
        </CardContent>
      </Card>
    );
  }

  const receipts = data?.receipts || [];

  return (
    <>
      <Card>
        <CardHeader className="border-b pb-4">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Banknote className="h-4 w-4 text-primary" />
            Billing & Receipts
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {receipts.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
              <FileText className="h-10 w-10 opacity-20 mb-3" />
              <p className="text-sm">No generated receipts found for this patient.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {receipts.map((receipt) => (
                <div 
                  key={receipt.receipt_id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-muted/30 transition-colors gap-3"
                >
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">
                        {receipt.invoice?.invoice_number || (receipt.receipt_type === 'advance_deposit' ? 'Advance Deposit' : 'N/A')}
                      </span>
                      <span className="text-xs text-muted-foreground">|</span>
                      <span className="font-semibold text-xs">
                        {format(new Date(receipt.payment_date || receipt.createdAt), 'dd/MM/yyyy, hh:mm a')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {receipt.receipt_number}
                      </span>
                      <Badge variant="outline" className="text-[10px] uppercase font-semibold">
                        {(() => {
                          const Icon = paymentIcons[receipt.payment_method] || CreditCardIcon;
                          return <Icon className="mr-1 h-3 w-3 inline" />;
                        })()}
                        {paymentLabels[receipt.payment_method] || receipt.payment_method}
                      </Badge>
                    </div>
                    {receipt.notes && (
                      <p className="text-xs text-muted-foreground italic mt-1">
                        Note: {receipt.notes}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3 sm:self-start">
                    <span className="font-bold text-base text-green-600">
                      ₹{Number(receipt.amount).toFixed(2)}
                    </span>
                    <div className="flex items-center gap-1 border-l pl-3">
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
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

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
    </>
  );
}

export default PatientBillingTab;
