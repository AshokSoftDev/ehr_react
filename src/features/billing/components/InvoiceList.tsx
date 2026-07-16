import { format } from "date-fns";
import { Eye, CheckCircle2, Clock, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface InvoiceListProps {
  invoices: any[];
  isLoading: boolean;
  onViewInvoice: (invoiceId: number) => void;
}

export function InvoiceList({ invoices, isLoading, onViewInvoice }: InvoiceListProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 p-0">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 w-full bg-muted animate-pulse rounded-md"></div>
        ))}
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground border rounded-md border-dashed">
        No invoices found for this patient.
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none h-6 px-2"><CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Paid</Badge>;
      case 'partial':
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-none h-6 px-2"><Clock className="w-3.5 h-3.5 mr-1" /> Partial</Badge>;
      default:
        return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-none h-6 px-2"><FileText className="w-3.5 h-3.5 mr-1" /> Draft</Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="bg-card border rounded-md overflow-hidden">
        <div className="divide-y divide-border">
          {invoices.map((invoice) => (
            <div key={invoice.invoice_id} className="group/item relative flex flex-col sm:flex-row sm:items-center justify-between p-2 hover:bg-muted/30 transition-colors gap-4">
              <div className="flex-1 flex flex-col gap-2">

                {/* Top Row: Invoice Number, Status, Date */}
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-bold text-base text-foreground">
                    {invoice.invoice_number}
                  </span>
                  {getStatusBadge(invoice.status)}
                  <span className="text-muted-foreground text-sm ml-auto sm:ml-2">
                    {format(new Date(invoice.invoice_date), "dd MMM yyyy")}
                  </span>
                </div>

                {/* Bottom Row: Financials */}
                <div className="flex items-center gap-6 mt-1">
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">₹{Number(invoice.net_total).toFixed(2)}</span>
                  </div>

                  <div className="flex flex-col">
                    <span className="font-medium text-sm text-green-600">₹{Number(invoice.paid_amount || 0).toFixed(2)}</span>
                  </div>

                  <div className="flex flex-col">
                    <span className="font-bold text-sm text-orange-600">₹{Number(invoice.balance_amount || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Right Action */}
              <div className="flex items-center pl-4 border-l border-border/50 shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-primary h-8 hover:bg-blue-50 hover:text-blue-600"
                  onClick={() => onViewInvoice(invoice.invoice_id)}
                >
                  <Eye className="h-4 w-4" />
                  {Number(invoice.balance_amount) > 0 ? "View & Pay" : "View"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
