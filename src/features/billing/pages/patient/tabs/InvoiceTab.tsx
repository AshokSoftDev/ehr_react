import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Plus, Eye, CheckCircle2, Clock } from "lucide-react";
import { billingService } from "@/features/billing/services/billing.service";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Props {
  patientId: number;
}

export default function InvoiceTab({ patientId }: Props) {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["patient-invoices", patientId],
    queryFn: () => billingService.listInvoices({ patient_id: patientId, limit: 100 }),
    enabled: !!patientId,
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100"><CheckCircle2 className="w-3 h-3 mr-1" /> Paid</Badge>;
      case 'partial':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-100"><Clock className="w-3 h-3 mr-1" /> Partial</Badge>;
      default:
        return <Badge variant="secondary" className="bg-muted text-muted-foreground hover:bg-muted">Draft</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold tracking-tight">Invoice History</h2>
        <Button onClick={() => navigate(`/main/billing/invoice?patientId=${patientId}`)} size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Generate Invoice
        </Button>
      </div>

      <div className="border rounded-md overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-muted-foreground border-b">
            <tr>
              <th className="font-medium text-left p-3">Invoice No.</th>
              <th className="font-medium text-left p-3">Date</th>
              <th className="font-medium text-right p-3">Total Amount</th>
              <th className="font-medium text-right p-3">Paid Amount</th>
              <th className="font-medium text-right p-3">Balance</th>
              <th className="font-medium text-center p-3">Status</th>
              <th className="font-medium text-right p-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-muted-foreground">Loading invoices...</td>
              </tr>
            ) : data?.invoices.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-muted-foreground">No invoices found for this patient.</td>
              </tr>
            ) : (
              data?.invoices.map((invoice: any) => (
                <tr key={invoice.invoice_id} className="hover:bg-muted/30">
                  <td className="p-3 font-medium">{invoice.invoice_number}</td>
                  <td className="p-3 text-muted-foreground">{format(new Date(invoice.invoice_date), "dd MMM yyyy")}</td>
                  <td className="p-3 text-right">₹{Number(invoice.net_total).toFixed(2)}</td>
                  <td className="p-3 text-right text-green-600">₹{Number(invoice.paid_amount || 0).toFixed(2)}</td>
                  <td className="p-3 text-right font-medium text-orange-600">₹{Number(invoice.balance_amount || 0).toFixed(2)}</td>
                  <td className="p-3 text-center">{getStatusBadge(invoice.status)}</td>
                  <td className="p-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1 text-primary h-8"
                      onClick={() => navigate(`/main/billing/invoice?invoiceId=${invoice.invoice_id}&patientId=${patientId}`)}
                    >
                      <Eye className="h-3.5 w-3.5" /> 
                      {Number(invoice.balance_amount) > 0 ? "View & Pay" : "View"}
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
