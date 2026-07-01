import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Printer, Receipt as ReceiptIcon, Eye } from "lucide-react";
import { billingService } from "@/features/billing/services/billing.service";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { type Receipt } from "@/features/billing/types/billing.types";

interface Props {
  patientId: number;
}

export default function LedgerTab({ patientId }: Props) {
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["patient-receipts", patientId],
    queryFn: () => billingService.listReceipts({ patient_id: patientId, limit: 100 }),
    enabled: !!patientId,
  });

  const handlePrintReceipt = (receipt: Receipt) => {
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
            .details { font-size: 14px; margin-bottom: 30px; }
            .detail-row { display: flex; justify-content: space-between; margin-bottom: 12px; border-bottom: 1px solid #eee; padding-bottom: 8px; }
            .detail-label { color: #666; }
            .detail-value { font-weight: 500; text-align: right; }
            .footer { text-align: center; font-size: 12px; color: #888; margin-top: 40px; border-top: 2px dashed #ccc; padding-top: 20px; }
            @media print {
              body { padding: 0; }
              .container { border: none; padding: 0; max-width: 100%; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>RECEIPT</h1>
              <p>${receipt.receipt_number}</p>
              <p>${format(new Date(receipt.payment_date), "dd MMM yyyy, hh:mm a")}</p>
            </div>
            
            <div class="amount-box">
              <div class="amount-label">AMOUNT PAID</div>
              <div class="amount-value">₹${Number(receipt.amount).toFixed(2)}</div>
            </div>

            <div class="details">
              <div class="detail-row">
                <span class="detail-label">Payment Method</span>
                <span class="detail-value" style="text-transform: capitalize">${receipt.payment_method?.replace("_", " ") || "Cash"}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Type</span>
                <span class="detail-value" style="text-transform: capitalize">${receipt.receipt_type?.replace("_", " ") || "Payment"}</span>
              </div>
              ${receipt.invoice_id ? `
              <div class="detail-row">
                <span class="detail-label">Invoice Ref</span>
                <span class="detail-value">${receipt.invoice?.invoice_number || receipt.invoice_id}</span>
              </div>
              ` : ''}
              ${receipt.notes ? `
              <div class="detail-row">
                <span class="detail-label">Notes</span>
                <span class="detail-value">${receipt.notes}</span>
              </div>
              ` : ''}
            </div>

            <div class="footer">
              <p>Thank you!</p>
              <p style="margin-top: 5px">This is a computer generated receipt.</p>
            </div>
          </div>
        </body>
        </html>
      `);
      doc.close();

      iframe.onload = () => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => {
          document.body.removeChild(iframe);
          document.title = originalTitle;
        }, 500);
      };
    }
  };

  return (
    <div className="space-y-4">
      <div className="border rounded-md overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-muted-foreground border-b">
            <tr>
              <th className="font-medium text-left p-3">Receipt No.</th>
              <th className="font-medium text-left p-3">Date</th>
              <th className="font-medium text-left p-3">Invoice No.</th>
              <th className="font-medium text-left p-3">Type</th>
              <th className="font-medium text-right p-3">Amount</th>
              <th className="font-medium text-center p-3">Method</th>
              <th className="font-medium text-left p-3">Notes</th>
              <th className="font-medium text-right p-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-muted-foreground">Loading ledger...</td>
              </tr>
            ) : data?.receipts.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-muted-foreground">No receipts found for this patient.</td>
              </tr>
            ) : (
              data?.receipts.map((receipt) => (
                <tr key={receipt.receipt_id} className="hover:bg-muted/30">
                  <td className="p-3 font-medium">
                    <div className="flex items-center gap-2">
                      <ReceiptIcon className="h-4 w-4 text-muted-foreground" />
                      {receipt.receipt_number}
                    </div>
                  </td>
                  <td className="p-3 text-muted-foreground">{format(new Date(receipt.payment_date), "dd MMM yyyy")}</td>
                  <td className="p-3 text-muted-foreground">
                    {receipt.invoice?.invoice_number ? (
                      <Badge variant="outline" className="bg-muted font-normal">{receipt.invoice.invoice_number}</Badge>
                    ) : "-"}
                  </td>
                  <td className="p-3 text-muted-foreground">
                    {receipt.receipt_type === 'advance_deposit' ? (
                      <Badge variant="outline" className="text-blue-600 bg-blue-50 border-blue-200">Advance Deposit</Badge>
                    ) : (
                      <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200">Payment</Badge>
                    )}
                  </td>
                  <td className="p-3 text-right font-medium">₹{Number(receipt.amount).toFixed(2)}</td>
                  <td className="p-3 text-center capitalize text-muted-foreground">{receipt.payment_method?.replace("_", " ")}</td>
                  <td className="p-3 text-muted-foreground text-xs max-w-[150px] truncate" title={receipt.notes || ""}>
                    {receipt.notes || "-"}
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1 text-primary h-8"
                        onClick={() => setSelectedReceipt(receipt)}
                      >
                        <Eye className="h-3.5 w-3.5" /> View
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1 text-primary h-8"
                        onClick={() => handlePrintReceipt(receipt)}
                      >
                        <Printer className="h-3.5 w-3.5" /> Print
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={!!selectedReceipt} onOpenChange={(open) => !open && setSelectedReceipt(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Receipt Details</DialogTitle>
          </DialogHeader>
          {selectedReceipt && (
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-muted-foreground">Receipt No</span>
                <span className="font-medium">{selectedReceipt.receipt_number}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium">{format(new Date(selectedReceipt.payment_date), "dd MMM yyyy, hh:mm a")}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-muted-foreground">Amount Paid</span>
                <span className="font-bold text-green-600">₹{Number(selectedReceipt.amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-muted-foreground">Payment Method</span>
                <span className="font-medium capitalize">{selectedReceipt.payment_method?.replace("_", " ") || "Cash"}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-muted-foreground">Type</span>
                <span className="font-medium capitalize">{selectedReceipt.receipt_type?.replace("_", " ") || "Payment"}</span>
              </div>
              {selectedReceipt.invoice_id && (
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-muted-foreground">Invoice Ref</span>
                  <span className="font-medium">{selectedReceipt.invoice?.invoice_number || selectedReceipt.invoice_id}</span>
                </div>
              )}
              {selectedReceipt.notes && (
                <div className="flex justify-between items-start border-b pb-2">
                  <span className="text-muted-foreground">Notes</span>
                  <span className="font-medium text-right max-w-[200px] text-sm break-words">{selectedReceipt.notes}</span>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
