import { format } from "date-fns";
import { Printer, Eye, Receipt as ReceiptIcon, FileText } from "lucide-react";
import { type Receipt } from "@/features/billing/types/billing.types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ReceiptListProps {
  receipts: Receipt[];
  isLoading: boolean;
  onViewReceipt: (receipt: Receipt) => void;
  onPrintReceipt: (receipt: Receipt) => void;
}

export function ReceiptList({ receipts, isLoading, onViewReceipt, onPrintReceipt }: ReceiptListProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 p-0">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 w-full bg-muted animate-pulse rounded-md"></div>
        ))}
      </div>
    );
  }

  if (receipts.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground border rounded-md border-dashed">
        No receipts found for this patient.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="bg-card overflow-hidden">
        <div className="divide-y divide-border">
          {receipts.map((receipt) => (
            <div key={receipt.receipt_id} className="group/item relative flex flex-col sm:flex-row sm:items-center justify-between p-2 hover:bg-muted/30 transition-colors gap-4">
              <div className="flex-1 flex flex-col gap-2">

                {/* Top Row: Receipt Number, Amount, Date */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                      <ReceiptIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="font-bold text-base text-foreground">
                      {receipt.receipt_number}
                    </span>
                  </div>

                  <span className="font-bold text-lg text-green-600">
                    ₹{Number(receipt.amount).toFixed(2)}
                  </span>

                  <span className="text-muted-foreground text-sm ml-auto sm:ml-2">
                    {format(new Date(receipt.payment_date), "dd MMM yyyy")}
                  </span>
                </div>

                {/* Bottom Row: Details */}
                <div className="flex items-center gap-6 mt-1 ml-10 flex-wrap">

                  <div className="flex flex-col">
                    {receipt.receipt_type === 'advance_deposit' ? (
                      <Badge variant="outline" className="text-blue-600 bg-blue-50 border-blue-200 h-5 px-1.5 text-xs shadow-none">Advance Deposit</Badge>
                    ) : (
                      <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200 h-5 px-1.5 text-xs shadow-none">Payment</Badge>
                    )}
                  </div>

                  <div className="flex flex-col">
                    <span className="font-medium text-sm text-foreground capitalize">
                      {receipt.payment_method?.replace("_", " ")}
                    </span>
                  </div>

                  {receipt.invoice?.invoice_number && (
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
                        <FileText className="h-3.5 w-3.5" />
                        {receipt.invoice.invoice_number}
                      </div>
                    </div>
                  )}

                  {receipt.notes && (
                    <div className="flex flex-col flex-1 min-w-[150px]">
                      <span className="text-xs text-muted-foreground truncate max-w-[250px]" title={receipt.notes}>
                        {receipt.notes}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Action */}
              <div className="flex items-center pl-4 border-l border-border/50 shrink-0 gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-primary hover:bg-blue-50 hover:text-blue-600 rounded-full"
                  onClick={() => onViewReceipt(receipt)}
                  title="View Receipt"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-green-600 hover:bg-green-50 rounded-full"
                  onClick={() => onPrintReceipt(receipt)}
                  title="Print Receipt"
                >
                  <Printer className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
